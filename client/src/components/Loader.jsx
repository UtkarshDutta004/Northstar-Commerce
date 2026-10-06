export default function Loader({ label = 'Loading' }) {
  return <div className="loader-wrap" role="status"><span className="loader-spinner" /><span>{label}</span></div>;
}
