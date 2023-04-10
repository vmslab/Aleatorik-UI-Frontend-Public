import { toRefs } from "vue";
import { storeToRefs } from "pinia";
import { Logout, removeCookie } from "@aleatorik-ui/common-api";
import { useLayoutStore, useLoadStore, useAlarmStore, useUserStore } from "../stores/mainStore";

export const useSignout = () => {
  const layout = useLayoutStore();
  const load = useLoadStore();
  const alarm = useAlarmStore();
  const user = useUserStore();

  const signout = async (isServerLogout: boolean = true) => {
    load.setLoad({ loading: true });
    try {
      if (isServerLogout) {
        await Logout();
      }
      removeCookie("refresh_token", { path: "/" });
      user.setUser({
        name: "",
        email: "",
        role: "",
      });
      layout.setLayout({
        ...storeToRefs(layout),
        login: false,
      });
      // alarm.setAlarm({
      //   message: "Sign Out Successed!",
      //   type: "success",
      // });
    } catch (error: any) {
      alarm.setAlarm({
        message: error.message,
        type: "error",
      });
    } finally {
      load.setLoad({ loading: false });
    }
  };

  return toRefs({ signout });
};
