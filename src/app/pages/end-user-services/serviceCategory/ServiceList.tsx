/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchServiceListByCategories } from "../../../modules/services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { ServiceModel } from "../../../models/global/serviceModel";
import { useLocation, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ServiceCard } from "./ServiceCard";
import { AdminMetSearch } from "../../../modules/components/metSearch/AdminMetSearch";
import { ApiCallType } from "../../../helper/_constant/apiCallType.constant";
import {
  fetchUserRolesAccessAsync,
  globalActions,
} from "../../../modules/services/globalSlice";
import { IRoleAcces } from "../../../models/global/globalGeneric";
import { useAuth } from "../../../modules/auth";
import { fetchServiceListByCategoriesAndUserRole } from "../../../modules/services/serviceRequestSlice";

const ServiceList: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useLang();
  const intl = useIntl();
  const { auth } = useAuth();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [categoryColor, setCategoryColor] = useState("");
  const [categoryIconName, setCategoryIconName] = useState("");
  const [services, setServices] = useState<ServiceModel[]>([]);
  const { userRoleAccess } = useAppSelector((s) => s.globalgeneric);

  let dir = "ltr";

  if (lang.toLowerCase() == "ar") {
    dir = "rtl";
  }

  useEffect(() => {
    if (!userRoleAccess || userRoleAccess.length == 0) {
      dispatch(fetchUserRolesAccessAsync())
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {
            if (orginalPromiseResult.data) {
              const authorizedRole = orginalPromiseResult.data as IRoleAcces[];
              dispatch(globalActions.updateUserRoleAccess(authorizedRole));
            }
          } else {
            console.error("fetching data error");
          }
        })
        .catch((error) => {
          console.error("fetching data error");
        });
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      var output = location.state
        ? JSON.parse(JSON.stringify(location.state)).categoryId
        : 0;

      var categoryColor = location.state
        ? JSON.parse(JSON.stringify(location.state)).categoryColor
        : "";
      setCategoryColor(categoryColor);

      var categoryIconName = location.state
        ? JSON.parse(JSON.stringify(location.state)).categoryIconName
        : "";
      setCategoryIconName(categoryIconName);

      setCategoryId(output);
      if (Number(categoryId) > 0) fetchServicesByStatus();
    }
  }, [categoryId]);

  const fetchServicesByStatus = (
    pageNumber?: number,
    pageSize?: number,
    searchText?: string
  ) => {
    // getAuthorizedUser(userRoleAccess, ModulesNameConstant.FMS, ModuleRoleAction.CREATE) === true;

    // setLoading(true);
    dispatch(
      fetchServiceListByCategoriesAndUserRole({
        pageNumber: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        categoryId: Number(categoryId),
        // roleName: userRoleAccess
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (orginalPromiseResult.data.data) {
            
            const responseData = orginalPromiseResult.data
              .data as ServiceModel[];
            setServices(responseData);
            console.log(responseData);
            // tableRef.current.setData(orginalPromiseResult.data.data);
            // tableRef.current.setTotalRows(
            //   orginalPromiseResult.data.totalCount
            // );
          }
        } else {
          console.error("fetching data error");
        }
        //setLoading(false);
      })
      .catch((error) => {
        console.error("fetching data error");
        //setLoading(false);
      });
  };

  const backOnClick = () => {
    navigate("/service-request-dashboard");
  };

  return (
    <>
      <div className="d-flex gap-8 flex-column">
        <img src="/media/svg/logo/full-mod-logo.svg" className={"h-80px"}></img>
        <div className="container">
          <AdminMetSearch
            apiCallType={ApiCallType.FilterServiceByCategoryDashboard}
            categoryId={categoryId}
          />

          <br />
          <>
            <button
              className="btn btn-sm fw-bold roudButton text-gold align-self-start mb-3"
              onClick={backOnClick}
            >
              {lang == "en" ? (
                <FontAwesomeIcon icon={faArrowLeft} color="text-gold" />
              ) : (
                <FontAwesomeIcon icon={faArrowRight} color="text-gold" />
              )}
              <span className="text ps-2">
                {intl.formatMessage({ id: "HOMEPAGE.BACK.TO.DOMAIN" })}
              </span>
            </button>
            <div className="d-flex flex-column gap-4">
              {services &&
                services.map((item, index) => (
                  <>
                    <ServiceCard
                      serviceId={item.serviceId!}
                      serviceName={item.serviceName}
                      categoryColor={categoryColor}
                      serviceDescription={item.serviceDescription}
                      categoryIconName={categoryIconName}
                    ></ServiceCard>
                  </>
                ))}
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export { ServiceList };
