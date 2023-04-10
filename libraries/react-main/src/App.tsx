import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { useQuery } from "react-query";
import Routes from "./router";
import { isElectron, init, theme as themeData, Refresh, getCookie, removeCookie } from "@mozart-ui/common-api";
import { decodeEscapeAtob } from "@mozart-ui/common-ui";
import { layoutState, pathState, themeState, userState, loadState, appRenderType } from "./stores/mainStore";
import { setAppTheme } from "./utils/theme";
import Loader from "./components/Loader";

const App: React.FC = () => {
  const [layout, setLayout] = useRecoilState(layoutState);
  const [theme, setTheme] = useRecoilState(themeState);
  const setUser = useSetRecoilState(userState);
  const setLoad = useSetRecoilState(loadState);
  const renderType = useRecoilValue(appRenderType);
  const [path, setPath] = useRecoilState(pathState);
  const handleResize = () => {
    setLayout(oldVal => ({
      ...oldVal,
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  };

  const token = decodeEscapeAtob(getCookie("refresh_token"));

  const { isLoading, isError, data, error } = useQuery(["login", token], Refresh, {
    onSuccess: result => {
      if (result && result.data && result.data.success) {
        setLayout(oldVal => ({
          ...oldVal,
          login: true,
        }));
        setUser(() => ({
          name: result.data.userName,
          email: result.data.email,
          role: result.data.role,
        }));
      } else {
        removeCookie("refresh_token");
      }
      setLoad({ loading: false });
    },
    onError: (err: any) => {
      console.log(err);
      setLoad({ loading: false });
    },
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  const navigate = useNavigate();

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    if (isElectron) {
      const url = new URL(import.meta.env.VITE_GRPC_SERVER);
      init(url.host);
    }

    setTheme(oldVal => ({
      ...oldVal,
      themeData,
    }));
    setAppTheme(theme, layout);

    switch (renderType) {
      case 2:
        if (path.startsWith("/user")) {
          navigate(path);
        } else {
          navigate("/user");
        }
        break;
      case 3:
        navigate("/dev");
        break;
      default:
        if (location.pathname !== "/") {
          setPath(location.pathname);
          navigate("/");
        }
        break;
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [renderType]);

  if (isLoading && token) {
    setLoad({ loading: true });
    return <Loader />;
  }

  if (isError && token) return <>Error: {(error as any).message}</>;

  return (
    <>
      <Routes />
      <Loader />
    </>
  );
};

export default App;
