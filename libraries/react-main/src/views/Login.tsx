import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import Button from "devextreme-react/button";
import TextBox from "devextreme-react/text-box";
import { Validator, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/validator";
import { CheckBox } from "devextreme-react/check-box";

import { Login as LoginCall, getCookie, setCookie, parseExpires, removeCookie } from "@aleatorik-ui/common-api";
import { encodeUnescapeBtoa, decodeEscapeAtob } from "@aleatorik-ui/common-ui";
import { layoutState, loadState, alarmState, userState } from "../stores/mainStore";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [id, setId] = useState(decodeEscapeAtob(getCookie("save_id")));
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(id ? true : false);
  const setLayout = useSetRecoilState(layoutState);
  const setLoad = useSetRecoilState(loadState);
  const setAlarm = useSetRecoilState(alarmState);
  const setUser = useSetRecoilState(userState);
  const failedLogin = (message: string) => {
    setAlarm(() => ({
      message,
      type: "error",
    }));
  };

  const mutation = useMutation(LoginCall, {
    onSuccess: result => {
      if (result && result.data && result.data.success) {
        setCookie("refresh_token", encodeUnescapeBtoa(result.data.refreshToken), {
          sameSite: "strict",
          expires: parseExpires(result.data.expiration),
        });
        if (saveId) {
          setCookie("save_id", encodeUnescapeBtoa(id), { sameSite: "strict" });
        } else {
          removeCookie("save_id");
        }
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
        failedLogin("SignIn Failed!");
      }
      setLoad({ loading: false });
    },
    onError: (err: any) => {
      setLoad({ loading: false });
      failedLogin(err.message);
    },
  });

  const onLogin = async () => {
    if (!id || !password) return;
    setLoad({ loading: true });
    mutation.mutate({ userName: id, password });
  };

  return (
    <div className="moz-login">
      <div className="moz-login-title">Login</div>
      <TextBox value={id} placeholder="UserName" onValueChange={setId} onEnterKey={onLogin}>
        <Validator>
          <RequiredRule />
          <PatternRule pattern={/^[a-zA-Z0-9]+$/} message={"`${'UserName'} must be a english and number.`"} />
        </Validator>
      </TextBox>
      <TextBox value={password} mode="password" placeholder="Password" onValueChange={setPassword} onEnterKey={onLogin}>
        <Validator>
          <RequiredRule />
          <StringLengthRule min={4} />
        </Validator>
      </TextBox>
      <Button
        className="moz-button-login"
        type="default"
        stylingMode="contained"
        useSubmitBehavior={true}
        text={t("Login") as string}
        width={430}
        height={65}
        onClick={onLogin}
      ></Button>
      <div className="moz-login-control">
        <div>
          <CheckBox value={saveId} text={t("SaveID") as string} width={100} onValueChange={setSaveId} />
        </div>
        {/* <div style="vertical-align: top">
        <a :href="`mailto:${adminEamil}`" className="moz-link">{{ "request_admin" }}</a>
      </div> */}
      </div>
    </div>
  );
};

export default Login;
