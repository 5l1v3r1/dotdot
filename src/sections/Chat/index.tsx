import React, { useEffect, useCallback } from 'react'
import classNames from 'classnames'
import smoothscroll from 'smoothscroll-polyfill'

import { useGlobalState } from 'store/state'
import Loader from 'components/Loader'

import styles from './index.module.scss'
import Header from './Header'
import Messages from './Messages'
import TextBox from './Footer'
import { useImmer } from 'use-immer'
import { Message } from 'store/types'

// fix for browser with no smooth scrolling
smoothscroll.polyfill()

type State = {
  isTextBoxFocused: boolean
  scrollingWhileFocused: boolean
  replyTo: Message | null
}

export default () => {
  const { state } = useGlobalState()
  const [localState, setState] = useImmer<State>({
    isTextBoxFocused: false,
    scrollingWhileFocused: false,
    replyTo: null,
  })

  const onMessageClick = useCallback(
    (messageTimestamp: number) => {
      setState((draft) => {
        const messageReply =
          state.messages.find(
            (eachMessage) =>
              eachMessage.timestamp.getTime() === messageTimestamp
          ) || null
        console.log('replying to ', messageReply)
        draft.replyTo = messageReply
      })
    },
    [state.messages, setState]
  )

  const cancelReply = useCallback(() => {
    setState((draft) => {
      draft.replyTo = null
    })
  }, [setState])

  // On window scroll
  const setHeaderPosition = useCallback(() => {
    setState((draft) => {
      if (draft.isTextBoxFocused) {
        draft.scrollingWhileFocused = true
      }
    })
    // eslint-disable-next-line
  }, [setState])

  useEffect(() => {
    window.addEventListener('scroll', setHeaderPosition, true)

    return () => {
      window.removeEventListener('scroll', setHeaderPosition)
    }
  }, [setHeaderPosition])

  const handleTextBoxFocus = () => {
    setState((draft) => {
      draft.isTextBoxFocused = true
    })
    setHeaderPosition()
  }

  if (!state.socket.connected) {
    return <Loader />
  }

  const handleTextBoxBlur = () => {
    setState((draft) => {
      draft.isTextBoxFocused = false
      draft.scrollingWhileFocused = false
    })
  }

  return (
    <div
      className={classNames(styles.chat, {
        [styles.scrollingChat]: localState.scrollingWhileFocused,
      })}
    >
      <Header scrollingWhileFocused={localState.scrollingWhileFocused} />

      <Messages onMessageClick={onMessageClick} />

      <TextBox
        replyTo={localState.replyTo}
        onFocus={handleTextBoxFocus}
        onBlur={handleTextBoxBlur}
        onCancelReply={cancelReply}
      />
    </div>
  )
}
