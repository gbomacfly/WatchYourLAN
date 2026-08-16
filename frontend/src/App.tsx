import { lazy, onMount } from 'solid-js';
import { Router, Route } from "@solidjs/router";
import './App.css';
import { runAtStart } from './functions/atstart';

import Body from './pages/Body';
import Sidebar from './components/Sidebar';

function App() {

  onMount(() => {
    runAtStart();
  });

  const Config = lazy(() => import("./pages/Config"));
  const History = lazy(() => import("./pages/History"));
  const HostPage = lazy(() => import("./pages/HostPage"));

  return (
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <Sidebar></Sidebar>
      <main class="flex-1 min-w-0 px-6 sm:px-8 py-8">
        <Router>
          <Route path="/" component={Body}/>
          <Route path="/config" component={Config}/>
          <Route path="/history" component={History}/>
          <Route path="/host/:id" component={HostPage}/>
        </Router>
      </main>
    </div>
  )
}

export default App
