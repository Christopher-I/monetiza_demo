// src/hoc/ProtectedRoute.js
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkAuthentication, loading as loader, notLoading } from "../store/authSlice";
import MainLayout from '../components/MainLayout'
import Loading from '../components/Loading'
import axios from 'axios';
import NProgress from 'nprogress';
import { refetchCards } from "../store/cardSlice";

const withProtectedRoute = (WrappedComponent, activeSidebar) => {

  // const dispatch = useDispatch();

  // axios.interceptors.request.use((config) => {
  //     NProgress.start();  // Start the progress bar when a request is made
  //     dispatch(loading())

  //     // Optionally, handle download/upload progress
  //     if (config.onDownloadProgress) {
  //       const originalOnDownloadProgress = config.onDownloadProgress;
  //       config.onDownloadProgress = (progressEvent) => {
  //         const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //         NProgress.set(percentage / 100);  // Update the progress bar based on percentage
  //         console.log(percentage, "percentage")
  //         if(percentage == 1) dispatch(notLoading())
  //         originalOnDownloadProgress(progressEvent);  // Call the original onDownloadProgress
  //       };
  //     }

  //     return config;
  //   }, (error) => {
  //     NProgress.done();   // End the progress bar in case of error
  //     dispatch(notLoading())
  //     return Promise.reject(error);
  //   });

  //   // Global response interceptor to stop the NProgress bar
  //   axios.interceptors.response.use(
  //     (response) => {
  //       NProgress.done();  // Complete the progress bar on successful response
  //       dispatch(notLoading())
  //       return response;
  //     },
  //     (error) => {
  //       NProgress.done();  // Complete the progress bar if there's an error
  //       dispatch(notLoading())
  //       return Promise.reject(error);
  //     }
  //   );


  const ProtectedComponent = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
    const translateRef = useRef()

    useEffect(() => {
      if (translateRef.current === 1) return;
      const userLanguage = user?.personal_info?.language || "en";

      localStorage.setItem("userLanguage", userLanguage)

      document.documentElement.lang = userLanguage;
      // Load the Google Translate script
      const addGoogleTranslateScript = () => {
        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);

        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", autoDisplay: false },
            "google_translate_element"
          );
        };
      };

      addGoogleTranslateScript();
      translateRef.current = 1
    }, []);

    axios.interceptors.request.use((config) => {
      NProgress.start();  // Start the progress bar when a request is made
      // dispatch(loader())

      // Optionally, handle download/upload progress
      if (config.onDownloadProgress) {
        const originalOnDownloadProgress = config.onDownloadProgress;
        config.onDownloadProgress = (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          NProgress.set(percentage / 100);  // Update the progress bar based on percentage
          console.log(percentage, "percentage")
          if (percentage == 1) dispatch(notLoading())
          originalOnDownloadProgress(progressEvent);  // Call the original onDownloadProgress
        };
      }
      if (config.onUploadProgress) {
        const originalOnUploadProgress = config.onUploadProgress;
        config.onUploadProgress = (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          NProgress.set(percentage / 100);  // Update the progress bar based on percentage
          console.log(percentage, "percentage")
          if (percentage == 1) dispatch(notLoading())
          originalOnUploadProgress(progressEvent);  // Call the original onDownloadProgress
        };
      }

      return config;
    }, (error) => {
      NProgress.done();   // End the progress bar in case of error
      dispatch(notLoading())
      return Promise.reject(error);
    });

    // Global response interceptor to stop the NProgress bar
    axios.interceptors.response.use(
      (response) => {
        NProgress.done();  // Complete the progress bar on successful response
        dispatch(notLoading())
        return response;
      },
      (error) => {
        NProgress.done();  // Complete the progress bar if there's an error
        dispatch(notLoading())
        return Promise.reject(error);
      }
    );

    useEffect(() => {
      dispatch(refetchCards());
      if (isAuthenticated === null) {
        dispatch(checkAuthentication());
      } else if (isAuthenticated === false) {
        navigate("/signin");
      }
    }, [isAuthenticated, dispatch, navigate]);

    // Show loading state while authentication is being checked
    if (loading || isAuthenticated === null) {
      return <Loading />;
    }

    // Render the wrapped component if authenticated
    return isAuthenticated ? <MainLayout activeSidebar={activeSidebar}><WrappedComponent {...props} /><div id="google_translate_element" style={{ position: "fixed", right: 0, top: 20, display: "none" }}></div></MainLayout> : null;
  };

  return ProtectedComponent;
};

export default withProtectedRoute;
