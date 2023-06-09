# Hand tracking component for React

This component used [Google's Gesture recognition API](https://developers.google.com/mediapipe/solutions/vision/gesture_recognizer) to predict gestures and location of hand landmarks from the user's webcam

## Features

- Recognized user's hand gestures
- Track 21 different hand landmarks
- Easy integration with any React project

## Installation

```shell
npm i react-hand-tracking # using npm
```

## Basic usage

```tsx
import React from 'react'
import { ReactHandTracking } from 'react-hand-tracking'

export default function App() {
  return (
    <main>
      <ReactHandTracking callback={(results) => console.log(results)} />
    </main>
  )
}
```

In this example, the results will be printed out to the console every frame

## Results object

The ReactHandTracking component will run your callback function passing the **results** array as the only argument. It is important to understand the structure of this object.

The results array will contain one entry for every hand present in the frame. Make sure to read the **configuration** section to learn how to configure the component to detect a custom number of hands.

```jsx
results: [
  { // Each object represents one hand. If the numHands prop is set to 1, the maximum length of the array will be 1.
    hand: { // information about the hand
      handType: "Right" | "Left",
      confidence: number (0-1) // how confident model is on the handType prediction. From 0 to 1
    },
    gesture: { // Information about the gesture being performed
      gestureType: // The gesture provided will be one of the following:
        | 'None'
        | 'Closed_Fist'
        | 'Open_Palm'
        | 'Pointing_Up'
        | 'Thumb_Down'
        | 'Thumb_Up'
        | 'Victory'
        | 'ILoveYou',
      confidence: number (0-1)
    },
    landmarks: [ // Array with lenght 21. Each entry represents a different hand landmark
                 // Refer to the next section on information about what element in the array represents which landmark
      {x: number, y: number, z: number},
      ...
    ]
  },
  ...
]
```

### Landmakrs:

Refer to the following image for information about how the hand landmarks are provided:
<img src="https://developers.google.com/static/mediapipe/images/solutions/hand-landmarks.png" alt="MarineGEO circle logo" style="height: 10em; "/>
For example, if we wanted to access the location of the index finger, we would access the 8th element in the landmarks array.

```jsx
const callback = (results) => {
  const indexPosition = results[0].landmarks[8]
  console.log(`The index finger is located at coordinates (${indexPosition.x}, ${indexPosition.y})`)
}
```

## Configuration

The element provides a number of configuration options that can be set through props.

| Prop name         | Description                                                                                                                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| callback          | The function specified by the user which takes the **results** object as an argument default value: `(result: ReactHandTrackingResult[]) => console.log(result)  `                                                                                                                                                                                      |
| videoResolution   | An object of the form `{ width: number, height: number }`. It specified the resolution of video to be processed by the model. A highier resolution can give a highier a better accuracy, but it will also affect performance. default value: `{ width: 1280, height: 720 }`,                                                                            |
| recognizerOptions | An object of the form `{ numHands: number detectionThreshold: number }`. The numHands entry specifies the maximum number of hands to be tracked by the model. The detectionThreshold is a number from 0 to 1 which specifies the confidence threshold for the model to start tracking a hand. default value: `{ numHands: 1, detectionThreshold: 0.5 }` |
| predictionTimeout | A number. Specifies the number of miliseconds to wait in between each prediction. A larger value will mean you have to wait more to receive an new **results** object, but will require consume less computation resources. default value: `0`                                                                                                          |

## Typescript

The package exports a typescript type for the result array given as an argument to the callback function.

```tsx
import React, { useState } from 'react'
import { ReactHandTracking, ReactHandTrackingResultType } from 'react-hand-tracking'

export default function App() {
  const [firstHandData, setFirstHandData] = useState<ReactHandTrackingResultType>(undefined)

  const handTrackingCallback = (result: ReactHandTrackingResultType[]) => setFirstHandData(result[0])

  return (
    <main>
      <ReactHandTracking callback={handTrackingCallback} />
    </main>
  )
}
```
