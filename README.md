# Hand tracking component for React

This component used Google's Gesture recognition API to predict gestures and location of hand landmarks from the user's webcam

##Usage:

```
import React from "react";
import { ReactHandTracking } from "react-hand-tracking";

export default function App() {
  return (
    <main>
      <HandTracker
        callback={(results) => console.log(results)}
      />
    </main>
  );
}
```

In this example, the results will be printed out to the console every frame
