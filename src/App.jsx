import { Route, Routes } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";

import LandingPageNav from "./components/landingNav";
import AddCardForm from "./pages/AddCardForm";
import Cards from "./pages/Cards";
import LandingPage from "./pages/LandingPage";
import Live from "./pages/Live";
import Signin from "./pages/Signin";
import OtpEmail from "./pages/Otp.email";
import SignUp from "./pages/SignUp";
import Stream from "./pages/Stream";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Chat from "./pages/Chat";
import Content from "./pages/Content";
import "./styles/main.css";
import New from "./pages/New";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import BeACreator from "./pages/BeACreator";
import Post from "./pages/Post";
import { ToastContainer } from "react-toastify";
import ContentForm from "./pages/ContentForm";
import { SocketProvider } from "./context/SocketContext";
import Dashboard from "./pages/Dashboard";
import Earnings from "./pages/Earnings";
import Following from "./pages/Following";
import Collections from "./pages/Collections";
import NewContentForm from "./pages/NewContentForm";
import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Status from "./pages/Status";
import ResetCreatorsPage from "./pages/ResetCreatorsPage";
import User from "./pages/User";
import PaypalSuccessPage from "./pages/PaypalSuccess";
import PaypalCancelPage from "./pages/PaypalCancel";
import { loading, notLoading } from "./store/authSlice";
import { useEffect } from "react";
import twemoji from "twemoji";
import Comment from "./pages/Comment";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import PageNotFound from "./pages/404.page";
import TermsAndConditions from "./pages/TermsAndConditions";
import CreatorsPage from "./pages/CreatorsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const App = () => {
  // useEffect(() => {
  //   const userLanguage = localStorage.getItem("userLanguage");

  //   document.documentElement.lang = userLanguage;
  //   // Load the Google Translate script
  //   const addGoogleTranslateScript = () => {
  //     const script = document.createElement("script");
  //     script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  //     script.async = true;
  //     document.body.appendChild(script);

  //     window.googleTranslateElementInit = () => {
  //       new window.google.translate.TranslateElement(
  //         { pageLanguage: "en" },
  //         "google_translate_element"
  //       );
  //     };
  //   };

  //   addGoogleTranslateScript();
  // }, []);

  // const dispatch = useDispatch();

  // axios.interceptors.request.use((config) => {
  //   NProgress.start();  // Start the progress bar when a request is made
  //   dispatch(loading())

  //   // Optionally, handle download/upload progress
  //   if (config.onDownloadProgress) {
  //     const originalOnDownloadProgress = config.onDownloadProgress;
  //     config.onDownloadProgress = (progressEvent) => {
  //       const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //       NProgress.set(percentage / 100);  // Update the progress bar based on percentage
  //       if(percentage == 1) dispatch(notLoading())
  //       originalOnDownloadProgress(progressEvent);  // Call the original onDownloadProgress
  //     };
  //   }

  //   return config;
  // }, (error) => {
  //   NProgress.done();   // End the progress bar in case of error
  //   dispatch(notLoading())
  //   return Promise.reject(error);
  // });

  // // Global response interceptor to stop the NProgress bar
  // axios.interceptors.response.use(
  //   (response) => {
  //     NProgress.done();  // Complete the progress bar on successful response
  //     dispatch(notLoading())
  //     return response;
  //   },
  //   (error) => {
  //     NProgress.done();  // Complete the progress bar if there's an error
  //     dispatch(notLoading())
  //     return Promise.reject(error);
  //   }
  // );

  useEffect(() => {
    twemoji.parse(document.body, { folder: "svg", ext: ".svg" });
  }, []);

  return (
    <Provider store={store}>
      <SocketProvider>
        <Routes>
          {/* Routes with LandingPageNav */}
          <Route element={<LandingPageNav />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="otp-confirmation" element={<OtpEmail />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Add a dedicated route for sign-in outside of LandingPageNav */}
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<SignUp />} />

          {/* Routes wrapped with MainLayout */}
          <Route>
            <Route
              path="paypal/payment/success"
              element={<PaypalSuccessPage />}
            />
            <Route
              path="paypal/payment/cancel"
              element={<PaypalCancelPage />}
            />
            <Route path="chat" element={<Chat />} />
            <Route path="content" element={<Content />} />
            <Route path="content/new" element={<NewContentForm />} />
            <Route path="content/:id" element={<ContentForm />} />
            <Route path="user/:id" element={<User />} />
            <Route path="live/:streamId" element={<Live />} />
            <Route path="collections" element={<Collections />} />
            <Route path="stream" element={<Stream />} />
            <Route path="status/new" element={<Status />} />
            <Route path="settings" element={<Settings />} />
            <Route path="feed" element={<Feed />} />
            <Route path="following" element={<Following />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="new" element={<New />} />
            <Route path="profile" element={<Profile />} />
            <Route path="post/:id" element={<Post />} />
            <Route path="comment/:id" element={<Comment />} />
            <Route path="creator" element={<BeACreator />} />
            <Route path="creatorPage" element={<CreatorsPage />} />
            <Route path="creator/reset" element={<ResetCreatorsPage />} />
            <Route path="add-card" element={<AddCardForm />} />
            <Route path="my-cards" element={<Cards />} />
            <Route path="notifications" element={<Notifications />} />
            <Route
              path="terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />

            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
        <div className="h-0 w-0">
          <ToastContainer className={"h-0 w-0"} />
        </div>
      </SocketProvider>
    </Provider>
  );
};

export default App;
