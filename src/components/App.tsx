import React, { useEffect, useRef, memo } from 'react'
import { FilesetResolver, GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision'

let gestureRecognizer: GestureRecognizer
let lastVideoTime = -1

type Props = {
  callback?: (result: ReactHandTrackingResult[]) => any
  videoResolution?: { width: number; height: number }
  recognizerOptions?: {
    numHands?: number
    detectionThreshold?: number
  }
  predictionTimeout?: number
}

type GestureType =
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou'

export type ReactHandTrackingResult = {
  hand: {
    handType: 'Right' | 'Left'
    confidence: number
  }
  gesture: {
    gestureType: GestureType
    confidence: number
  }
  landmarks: { x: number; y: number; z: number }[]
}

const generateResult = (results: GestureRecognizerResult) => {
  const result: ReactHandTrackingResult[] = []
  for (let i = 0; i < results.handednesses.length; i++) {
    result.push({
      hand: {
        handType: (results.handednesses[i][0].categoryName == 'Right' ? 'Left' : 'Right') as 'Right' | 'Left',
        confidence: results.handednesses[i][0].score,
      },
      gesture: {
        gestureType: results.gestures[i][0].categoryName as GestureType,
        confidence: results.gestures[i][0].score,
      },
      landmarks: results.landmarks[i],
    })
  }

  return result
}

const ReactHandTracking = ({
  callback = (result: ReactHandTrackingResult[]) => console.log(result),
  videoResolution = { width: 1280, height: 720 },
  recognizerOptions = { numHands: 1, detectionThreshold: 0.5 },
  predictionTimeout = 0,
}: Props) => {
  const video = useRef<HTMLVideoElement>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setup = async () => {
    if (!video.current) return
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    )

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
        delegate: 'GPU',
      },
      numHands: recognizerOptions.numHands,
      runningMode: 'VIDEO',
      minHandDetectionConfidence: recognizerOptions.detectionThreshold,
      minHandPresenceConfidence: recognizerOptions.detectionThreshold,
      minTrackingConfidence: recognizerOptions.detectionThreshold,
    })

    navigator.mediaDevices
      .getUserMedia({ video: videoResolution, audio: false })
      .then((stream) => {
        video.current!.srcObject = stream
        video.current!.addEventListener('loadeddata', predict)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const predict = () => {
    const nowInMs = Date.now()
    if (video.current && lastVideoTime !== video.current!.currentTime) {
      lastVideoTime = video.current!.currentTime
      const results = gestureRecognizer.recognizeForVideo(video.current!, nowInMs)
      callback(generateResult(results))
    }
    setTimeout(() => requestAnimationFrame(predict), predictionTimeout)
  }

  useEffect(() => {
    setup()
  }, [video, recognizerOptions, setup])

  return (
    <div
      style={{
        display: 'none',
      }}
    >
      <video ref={video} autoPlay />
    </div>
  )
}

export default memo(ReactHandTracking, (prevProps, nextProps) => {
  if (
    prevProps.predictionTimeout != nextProps.predictionTimeout ||
    prevProps.recognizerOptions != nextProps.recognizerOptions ||
    prevProps.videoResolution != nextProps.videoResolution
  ) {
    return false
  } else return true
})
