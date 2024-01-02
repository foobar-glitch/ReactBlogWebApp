import Navbar from './components/Navbar';
import Home from './components/Home';
import Create from './components/Create';
import { BrowserRouter, Route, Switch } from 'react-router-dom/cjs/react-router-dom.min';
import BlogDetails from './components/BlogDetails';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Profile from './components/Profile';

function App() {
  return (
    <BrowserRouter>
      <div className='App'>
        <Navbar />
        <div className='content'>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/create">
              <Create />
            </Route>
            <Route exact path="/blogs/:id">
              <BlogDetails />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
         
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
