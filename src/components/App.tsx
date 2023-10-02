import React, { useEffect, useRef, memo } from 'react';
import { FilesetResolver, GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision';

let gestureRecognizer: GestureRecognizer;
let lastVideoTime = -1;

type Props = {
  callback?: (result: ReactHandTrackingResult[]) => any; // Callback function to handle gesture recognition results.
  videoResolution?: { width: number; height: number }; // Resolution of the video stream.
  recognizerOptions?: {
    numHands?: number; // Number of hands to track.
    detectionThreshold?: number; // Threshold for hand detection confidence.
  };
  predictionTimeout?: number; // Time delay between gesture recognition predictions.
};

type GestureType =
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou';

export type ReactHandTrackingResult = {
  hand: {
    handType: 'Right' | 'Left'; // Type of hand (Right or Left).
    confidence: number; // Confidence score for hand detection.
  };
  gesture: {
    gestureType: GestureType; // Type of gesture detected.
    confidence: number; // Confidence score for the detected gesture.
  };
  landmarks: { x: number; y: number; z: number }[]; // Hand landmarks (x, y, z coordinates).
};

// Function to convert GestureRecognizerResult to ReactHandTrackingResult.
const generateResult = (results: GestureRecognizerResult) => {
  const result: ReactHandTrackingResult[] = [];
  for (let i = 0; i < results.handednesses.length; i++) {
    result.push({
      hand: {
        handType: results.handednesses[i][0].categoryName == 'Right' ? 'Left' : 'Right',
        confidence: results.handednesses[i][0].score,
      },
      gesture: {
        gestureType: results.gestures[i][0].categoryName as GestureType,
        confidence: results.gestures[i][0].score,
      },
      landmarks: results.landmarks[i],
    });
  }
  return result;
};

/**
 * React component for hand tracking using MediaPipe.
 * @param callback - Function to be called with the results of the gesture recognition.
 * @param videoResolution - Object containing the width and height of the video resolution.
 * @param recognizerOptions - Object containing the options for the gesture recognizer.
 * @param predictionTimeout - Timeout for the prediction function.
 * @returns A React component for hand tracking.
 */
const ReactHandTracking = ({
  callback = (result: ReactHandTrackingResult[]) => console.log(result), // Default callback logs results to the console.
  videoResolution = { width: 1280, height: 720 }, // Default video resolution.
  recognizerOptions = { numHands: 1, detectionThreshold: 0.5 }, // Default recognizer options.
  predictionTimeout = 0, // Default prediction timeout.
}: Props) => {
  const video = useRef<HTMLVideoElement>(null);

  // Setup function to initialize gesture recognition.
  // Runs once when the component mounts.
  const setup = async () => {
    if (!video.current) return;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2-rc2/wasm',
    );

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
    });

    navigator.mediaDevices
      .getUserMedia({ video: videoResolution, audio: false })
      .then((stream) => {
        video.current!.srcObject = stream;
        video.current!.addEventListener('loadeddata', predict);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Function to perform gesture recognition predictions.
  const predict = () => {
    const nowInMs = Date.now();
    if (video.current && lastVideoTime !== video.current!.currentTime) {
      lastVideoTime = video.current!.currentTime;
      const results = gestureRecognizer.recognizeForVideo(video.current!, nowInMs);
      callback(generateResult(results)); // Call the callback function with the results.
    }
    setTimeout(() => requestAnimationFrame(predict), predictionTimeout);
  };

  // Initialize setup when the component mounts.
  useEffect(() => {
    setup();
  }, [video, recognizerOptions, setup]);

  return (
    <div
      style={{
        display: 'none', // Hidden video element.
      }}
    >
      <video ref={video} autoPlay />
    </div>
  );
};

export default memo(ReactHandTracking, (prevProps, nextProps) => {
  if (
    prevProps.predictionTimeout != nextProps.predictionTimeout ||
    prevProps.recognizerOptions != nextProps.recognizerOptions ||
    prevProps.videoResolution != nextProps.videoResolution
  ) {
    return false;
  } else return true;
});
