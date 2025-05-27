The `useMemo` hook in React is used for **memoization**. It allows you to memoize the result of a function call, meaning React will skip re-calculating it on every re-render unless its dependencies have changed. This is a performance optimization technique, particularly useful for expensive computations.

### How `useMemo` works:

`useMemo(callback, dependencies)`

1.  **`callback`**: A function that computes the value you want to memoize. This function will run during the initial render and only when one of the dependencies changes.
2.  **`dependencies`**: An array of values that the memoized value depends on. If any of these values change between renders, `useMemo` will re-run the `callback` function. If the array is empty (`[]`), the `callback` will only run once on the initial render.

### When to use `useMemo`:

- **Expensive computations**: When you have a calculation that takes a significant amount of time or resources, and its result doesn't change frequently.
- **Preventing unnecessary re-renders of child components**: If you're passing an object or array (which would be a new reference on every render) as a prop to a `React.memo`'d child component, `useMemo` can ensure the reference remains the same, preventing the child from re-rendering unnecessarily.

---

### Example: Calculating a Factorial (Expensive Operation)

Let's imagine we have a component that displays a factorial of a number and also has an unrelated counter. Without `useMemo`, incrementing the counter (which doesn't affect the factorial calculation) would still cause the factorial to be re-calculated, leading to a noticeable delay if the calculation is slow.

**Scenario:**

1.  A "slow" function `calculateFactorial` that takes some time to compute.
2.  A state `number` whose factorial we want to calculate.
3.  An unrelated state `count` that updates frequently.

---

**Code:**

```jsx
import React, { useState, useMemo } from "react"

// --- Simulate an expensive calculation ---
function calculateFactorial(num) {
  console.log(`Calculating factorial for ${num}...`)
  // Simulate a delay
  let i = 0
  while (i < 200000000) {
    // A busy-wait loop to make it "slow"
    i++
  }

  if (num < 0) return -1
  if (num === 0) return 1
  let result = 1
  for (let j = 1; j <= num; j++) {
    result *= j
  }
  return result
}

function MemoExample() {
  const [number, setNumber] = useState(1)
  const [count, setCount] = useState(0)

  // Without useMemo: This would re-run calculateFactorial on every render
  // const factorial = calculateFactorial(number);

  // With useMemo: This will ONLY re-run calculateFactorial when 'number' changes.
  // If 'count' changes, the component re-renders, but calculateFactorial is skipped.
  const factorial = useMemo(() => calculateFactorial(number), [number])

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h1>`useMemo` Hook Example</h1>

      <section>
        <h2>Unrelated Counter</h2>
        <p>
          This counter updates quickly because its changes don't trigger the
          expensive calculation.
        </p>
        <p>
          Current Count: <strong>{count}</strong>
        </p>
        <button onClick={() => setCount((c) => c + 1)}>Increment Count</button>
      </section>

      <hr style={{ margin: "30px 0" }} />

      <section>
        <h2>Factorial Calculation</h2>
        <p>
          This calculation is expensive. Notice the delay when you change the
          number, but not when you increment the unrelated counter.
        </p>
        <p>
          Number for Factorial:
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
            min="0"
            max="15" // Keep it manageable to avoid infinite loops / huge numbers
          />
        </p>
        <p>
          Factorial of {number} is: <strong>{factorial}</strong>
        </p>
      </section>

      <p style={{ marginTop: "20px", fontSize: "0.9em", color: "#555" }}>
        Check your browser's console. You'll see "Calculating factorial..." only
        when you change the "Number for Factorial", not when you click
        "Increment Count".
      </p>
    </div>
  )
}

export default MemoExample
```

---

### Explanation:

1.  **`calculateFactorial(num)` function**: This is our "expensive" function. It includes a `while` loop to simulate a delay, making the performance difference noticeable. It also logs to the console so you can see when it's actually running.
2.  **`useState(1)` for `number`**: This state holds the number for which we want to calculate the factorial.
3.  **`useState(0)` for `count`**: This is an unrelated state. Clicking "Increment Count" will cause the `MemoExample` component to re-render.
4.  **`const factorial = useMemo(() => calculateFactorial(number), [number]);`**:
    - The `useMemo` hook is used here.
    - The first argument is an arrow function `() => calculateFactorial(number)`. This is the function whose result we want to memoize. It will return the factorial of `number`.
    - The second argument, `[number]`, is the **dependency array**. This tells `useMemo` that if the value of `number` changes, it needs to re-run the `calculateFactorial` function. If `number` remains the same (even if other states like `count` change and trigger a re-render), `useMemo` will return the previously calculated (memoized) value.

### How to Run and Observe:

1.  Save the code as `MemoExample.jsx`.
2.  Create an `App.js` (or similar) to render it:

    ```jsx
    import React from "react"
    import MemoExample from "./MemoExample" // Adjust path if needed

    function App() {
      return (
        <div className="App">
          <MemoExample />
        </div>
      )
    }

    export default App
    ```

3.  Run your React application (e.g., `npm start` or `yarn start`).
4.  Open your browser's developer console.
5.  **Observe:**
    - When you **change the "Number for Factorial"** input, you'll notice a slight delay, and "Calculating factorial..." will appear in the console. This is expected, as the dependency (`number`) has changed.
    - When you **click "Increment Count"**, the `count` updates immediately. You will **not** see "Calculating factorial..." in the console, because `number` (the dependency for `useMemo`) has not changed. The memoized `factorial` value is reused.

This clearly demonstrates how `useMemo` prevents unnecessary re-calculations, leading to a smoother user experience for unrelated state updates.
