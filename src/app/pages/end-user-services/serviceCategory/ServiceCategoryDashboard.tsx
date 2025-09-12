/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { ServiceCategory } from "./ServiceCategory";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchCategoryListWithServiceCount } from "../../../modules/services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { CategoryWithServiceCountModel } from "../../../models/global/serviceModel";
import { writeToBrowserConsole } from "../../../modules/utils/common";
import { AdminMetSearch } from "../../../modules/components/metSearch/AdminMetSearch";
import { ApiCallType } from "../../../helper/_constant/apiCallType.constant";
import { IRoleAcces } from "../../../models/global/globalGeneric";
import {
  fetchUserRolesAccessAsync,
  globalActions,
} from "../../../modules/services/globalSlice";
import { useAuth } from "../../../modules/auth";

interface ServiceCategoryProps {
  title: string;
  count: number;
  iconName: string;
  color: string;
}
const ServiceCategoryDashboard: FC = () => {
  const lang = useLang();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [blankCardLength, setBlankCardLength] = useState(0);
  const [categories, setCategories] = useState<CategoryWithServiceCountModel[]>(
    []
  );
  const { auth } = useAuth();
  const { userRoleAccess } = useAppSelector((s) => s.globalgeneric);

  useEffect(() => {
    try {
      dispatch(fetchCategoryListWithServiceCount())
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData =
              originalPromiseResult.data as CategoryWithServiceCountModel[];
            setCategories(responseData);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    } catch (e) {}
  }, []);

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
    const dataSize = categories ? 3 - (categories.length % 3) : 0;
    if (dataSize !== 3) setBlankCardLength(dataSize);
  }, [categories]);

  let dir = "ltr";

  if (lang.toLowerCase() == "ar") {
    dir = "rtl";
  }

  return (
    <>
      <div className="d-flex gap-3 flex-column">
        <img src="/media/svg/logo/full-mod-logo.svg" className={"h-80px"}></img>
        <div className="container">
          <AdminMetSearch
            apiCallType={ApiCallType.FilterServiceCategoryDashboard}
          />

          <br />
          <div className="row g-6">
            <div className="card-grid-container">
              {categories &&
                categories.map((card, index) => (
                  <ServiceCategory
                    categoryNameAr={card.categoryNameAr}
                    serviceCount={card.serviceCount}
                    categoryIconName={card.categoryIconName}
                    categoryColor={card.categoryColor}
                    categoryId={card.categoryId}
                  ></ServiceCategory>
                ))}
              {!!blankCardLength &&
                new Array(blankCardLength).fill(1).map((_, index) => (
                  <div key={index} className="card-grid-item">
                    <div className="blank-domain-card"></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { ServiceCategoryDashboard };
