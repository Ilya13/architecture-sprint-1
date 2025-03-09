import React, { lazy }  from "react";
import ReactDOM from "react-dom/client";
import { Route, useHistory, Switch, BrowserRouter } from "react-router-dom";
import { CurrentUserContext } from "../../shared/src/contexts/CurrentUserContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import * as auth from "./utils/auth.js";

// Компоненты авторизации/регистрации
const Login = lazy(() => import('auth/Login').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));
const Register = lazy(() => import('auth/Register').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));
const InfoTooltip = lazy(() => import('auth/InfoTooltip').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));

// Компоненты картинок
const Main = lazy(() => import('cards/Main').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));
const ImagePopup = lazy(() => import('cards/ImagePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));
const AddPlacePopup = lazy(() => import('cards/AddPlacePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));

// Компоненты профиля
const Main = lazy(() => import('cards/Main').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
}));


function App() {
  // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  //В компоненты добавлены новые стейт-переменные: email — в компонент App
  const [email, setEmail] = React.useState("");
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const history = useHistory();


  function closeAllPopups() {
    setSelectedCard(null);
  }

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push("/signin");
  }

  function onLogin(email) {
    setIsLoggedIn(true);
    setEmail(email);
    history.push("/");
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleAddPlaceSubmit(newCard) {
    //setCards([newCardFull, ...cards]);
    closeAllPopups();
  }

  // при монтировании App описан эффект, проверяющий наличие токена и его валидности
  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      auth
        .checkToken(token)
        .then((res) => {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push("/");
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          console.log(err);
        });
    }
  }, [history]);

  return (
    // В компонент App внедрён контекст через CurrentUserContext.Provider
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            loggedIn={isLoggedIn}
            currentUser={currentUser}
            onCardClick={handleCardClick}
          />
          <Route path="/signup">
            <Register />
          </Route>
          <Route path="/signin">
            <Login onLogin={onLogin}/>
          </Route>
        </Switch>
        <Footer />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onAddPlace={handleAddPlaceSubmit}
          onClose={closeAllPopups}
        />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopups}
          status={tooltipStatus}
        />
      </div>
    </CurrentUserContext.Provider>
  )
}

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)