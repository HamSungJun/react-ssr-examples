export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>{error}</p>
      <button onClick={resetErrorBoundary}>reset</button>
    </div>
  );
}
