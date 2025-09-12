/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from "react";
import * as Yup from "yup";
import clsx from "clsx";
import { useFormik } from "formik";
import {
  getUserByToken,
  getUserName,
  login,
  loginNew,
} from "../core/_requests";
import { useAuth } from "../core/Auth";
import { useAppDispatch } from "../../../../store";
import { IPageLog } from "../../../models/global/globalGeneric";
import { insertPageLog } from "../../services/globalSlice";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";
import {
  BtnLabelCanceltxtMedium2,
  HeaderLabels,
  InfoLabels,
} from "../../components/common/formsLabels/detailLabels";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useIntl } from "react-intl";

const initialValues = {
  username: "",
  password: "",
};

export function Login() {
  const intl = useIntl();
  const lang = useLang();
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser, auth } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [isValidLogin, setIsValidLogin] = useState(true);
  const [isAdfsEnabled, setIsAdfsEnabled] = useState(
    process.env.REACT_APP_IS_ADFS_ENABLED
  );
  const [userName, setUserName] = useState("");

  const loginSchema = Yup.object().shape({
    username: Yup.string()
      //.email('Wrong email format')
      .min(
        3,
        intl
          .formatMessage({ id: "AUTH.VALIDATION.MIN_LENGTH_FIELD" })
          .replace("{length}", "3")
      )
      // .max(10, intl.formatMessage({ id: 'AUTH.VALIDATION.MAX_LENGTH_FIELD' }).replace('{length}', "10"))
      .required(
        intl
          .formatMessage({ id: "AUTH.VALIDATION.REQUIRED" })
          .replace("{name}", intl.formatMessage({ id: "AUTH.INPUT.USERNAME" }))
      ),
    password: Yup.string()
      .min(
        3,
        intl
          .formatMessage({ id: "AUTH.VALIDATION.MIN_LENGTH_FIELD" })
          .replace("{length}", "3")
      )
      // .max(30, intl.formatMessage({ id: 'AUTH.VALIDATION.MAX_LENGTH_FIELD' }).replace('{length}', "30"))
      .required(
        intl
          .formatMessage({ id: "AUTH.VALIDATION.REQUIRED" })
          .replace("{name}", intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" }))
      ),
  });

  useEffect(() => {
    LoginUser("U00002", "testtest");
  }, [isValidLogin]);

  async function LoginUser(username, password) {
    try {
      const userDetails = await login(username, "ssss");

      if (userDetails) {
        const _userName = userDetails.data.userName;

        const { data: auth } = await login(
          _userName,
          userDetails.data.jwtToken
        );

        if (auth && auth.userName) {
          localStorage.setItem("oidc:tkn", userDetails.data.jwtToken);
          saveAuth(auth);
          const { data: user } = await getUserByToken(
            auth.jwtToken,
            auth.userName
          );
          setCurrentUser(user);
          setIsValidLogin(true);

          let formDataObject: IPageLog;
          formDataObject = {
            pageName: "Login",
            username: "",
          };
          dispatch(insertPageLog({ formDataObject }));

        } else {
          setIsValidLogin(false);
          saveAuth(undefined);
          setStatus("The login details are incorrect");
        }
      }
    } catch (error) {
      setIsValidLogin(false);
      console.error(error);
      saveAuth(undefined);
      setStatus("The login details are incorrect");
    }
    // }
  }

  // const fetchToken = async (pageNumber: number) => {
  //   try {
  //     const response = await dispatch(fetchTokenAsync());
  //   }
  //   catch (error) {
  //     // Handle errors
  //     console.error('Error fetching notifications:', error);
  //   }
  // };

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);

      try {
        const { data: auth } = await login(
          values.username,
          "ssss"
        );

        if (auth && auth.userName) {
          saveAuth(auth);
          const { data: user } = await getUserByToken(
            auth.jwtToken,
            auth.userName
          );
          setCurrentUser(user);
          setStatus("");
          setIsValidLogin(true);

          const formDataObject: IPageLog = {
            pageName: "Login",
            username: "",
          };

          await dispatch(insertPageLog({ formDataObject }));
        } else {
          saveAuth(undefined);
          setSubmitting(false);
          setIsValidLogin(false);
        }
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setSubmitting(false);
        setIsValidLogin(false);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <form className="form w-100" noValidate id="kt_login_signin_form">
        <div className="text-center mb-8">
          {/* {"isValidLogin==>"+isValidLogin} */}
          {lang === "ar" ? (
            <img
              src={toAbsoluteUrl(`/media/logos/png/logo-ar.png`)}
              className={`login-logo`}
            />
          ) : (
            <img
              src={toAbsoluteUrl(`/media/logos/png/logo.png`)}
              className={`login-logo`}
            />
          )}
        </div>

        <div className="text-center mb-8">
          {/* {
            (isValidLogin === false) &&
            <HeaderLabels isI18nKey={false} text={(lang === 'ar') ? 'المصادقة...' : 'Redirecting to Login...'} />
          } */}
          {!isValidLogin && (
            <HeaderLabels
              isI18nKey={false}
              text={lang === "ar" ? "المصادقة..." : "Authenticating..."}
            />
          )}
          {!isValidLogin && (
            <HeaderLabels
              isI18nKey={false}
              text={
                lang === "ar"
                  ? "Please contact administrator as your account does not exist in Smart Tawasul"
                  : "Please contact administrator as your account does not exist in Smart Tawasul"
              }
            />
          )}
        </div>
      </form>
    </>
  );
}
