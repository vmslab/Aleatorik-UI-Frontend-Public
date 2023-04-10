import { useSetRecoilState } from "recoil";
import { Logout, removeCookie } from "@aleatorik-ui/common-api";
import { layoutState, loadState, alarmState, userState } from "../stores/mainStore";

export const useSignout = () => {
  const setLayout = useSetRecoilState(layoutState);
  const setLoad = useSetRecoilState(loadState);
  const setAlarm = useSetRecoilState(alarmState);
  const setUser = useSetRecoilState(userState);

  const signout = async (isServerLogout: boolean = true) => {
    setLoad({ loading: true });
    try {
      if (isServerLogout) {
        await Logout();
      }
      removeCookie("refresh_token", { path: "/" });
      setUser(() => ({
        name: "",
        email: "",
        role: "",
      }));
      setLayout(oldVal => ({
        ...oldVal,
        login: false,
      }));
      // setAlarm(() => ({
      //   message: "Sign Out Successed!",
      //   type: "success",
      // }));
    } catch (error: any) {
      setAlarm(() => ({
        message: error.message,
        type: "error",
      }));
    } finally {
      setLoad({ loading: false });
    }
  };
  return { signout };
};
