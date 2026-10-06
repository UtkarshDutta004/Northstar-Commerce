import { ArrowLeft, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main className="page-shell not-found-page"><span className="not-found-number">404</span><p className="eyebrow">A detour, not a dead end</p><h1>This trail goes<br /><em>somewhere else.</em></h1><p>The page you're looking for isn't here. Let's find another way.</p><Link className="button button-dark" to="/"><ArrowLeft size={16} /> Back to Northstar</Link><Link className="not-found-shop" to="/products">Explore the collection <MoveUpRight size={15} /></Link></main>;
}
