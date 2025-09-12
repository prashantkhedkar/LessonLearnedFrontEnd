import { useEffect, useState } from "react";
import { ServiceRequestModel } from "../../../models/global/serviceModel";
import { DynamicFieldModel } from "../../../modules/components/dynamicFields/utils/types";
import { GetServiceRequestDetailsByRequestId } from "../../../modules/services/serviceRequestSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { EntityType } from "../../../helper/_constant/entity.constant";
import { useAppDispatch } from "../../../../store";
import DynamicFields from "../../../modules/components/dynamicFields/DynamicFields";
import { useForm } from "react-hook-form";
import {
  GlobalLabel,
  LabelHeaderText,
} from "../../../modules/components/common/label/LabelCategory";
import { useIntl } from "react-intl";

type props = {
  data: ServiceRequestModel;
};

export function ServiceRequestHeader({ data }: props) {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [requestorFieldData, setRequestorFieldData] = useState<DynamicFieldModel[]>([]);

  useEffect(() => {
    getSeviceRequestFieldsByEntity();
  }, []);

  const useFormHook = useForm({
    defaultValues: {},
    mode: "all",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });

  const requestorFields = new Set<number>([2, 3, 4, 6, 7, 8, 11]);

  const getSeviceRequestFieldsByEntity = () => {
    dispatch(
      GetServiceRequestDetailsByRequestId({
        serviceId: data.serviceId!,
        requestId: data.requestId,
        entityId: Number(EntityType.RequestingUnit),
      })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          var modelData = originalPromiseResult.data as DynamicFieldModel[];
          if (modelData && modelData.length > 0) {
            setRequestorFieldData(
              modelData.filter((formControl) =>
                requestorFields.has(formControl.fieldId)
              )
            );
          }
        }
      });
  };

  // Utility to chunk array into rows
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  const dynamicColumnsPerRow = 3; // Change this to set dynamic fields columns
  // Dynamic fields grid
  const dynamicFieldRows = chunkArray(requestorFieldData, dynamicColumnsPerRow);
  const renderDynamicFields = (
    <div className="px-0">
      {/* {JSON.stringify(dynamicFieldRows)} */}
      {dynamicFieldRows.map((row, rowIdx) => (
        <div className="row" key={rowIdx}>
          {row.map((formControl) => {
            return (
              <>
                {formControl.fieldId !== 11 ?
                  <div
                    className={`col-md-${12 / dynamicColumnsPerRow} mb-3`}
                    key={formControl.fieldKey}
                  >
                    <LabelHeaderText value={formControl.fieldLabel?.toString()} /> :
                    <LabelHeaderText customClass="" value={formControl.fieldValue?.toString()} />
                  </div> : <></>
                }
              </>
            );
          })}
        </div>

      ))}
    </div>
  );


  const renderPriority = (
    <div className="px-0">
      {/* {JSON.stringify(dynamicFieldRows)} */}
      {dynamicFieldRows.map((row, rowIdx) => (
        <div key={rowIdx}>
          {row.map((formControl) => {
            return (
              <>
                {formControl.fieldId == 11 && formControl.serviceFieldOption && formControl.serviceFieldOption.length > 0 ?
                  <div
                    className={`${formControl.serviceFieldOption.filter(o => o.value.toString() == formControl.fieldValue?.toString())[0].label.toString().toLowerCase()}-priority-ar`}
                    key={formControl.fieldKey}
                  >
                    {/* <LabelHeaderText value={formControl.fieldLabel?.toString()} /> : */}
                    <LabelHeaderText customClass="" value={formControl.serviceFieldOption.filter(o => o.value.toString() == formControl.fieldValue?.toString())[0].label.toString()} />
                  </div>
                  :
                  <></>
                }
              </>
            );
          })}
        </div>

      ))}
    </div>
  );

  return (
    <div className="service-header-container">
      <div className="d-flex flex-column gap-2">
        <div className="d-flex align-items-center gap-6  border-bottom  ">
          <div className="badge badge-gold py-2 gap-2 text-white ">
            <div>{renderPriority}</div>
            <div>{data.requestNumber}</div>
            <div> | </div>
            <div>{data.serviceName}</div>
          </div>
        </div>

        <div className="text-white gap-6">
          {renderDynamicFields}
        </div>
        {data.completionDate != "" &&

          <div className="text-white gap-6">
            <div className="row">
              <div className={`col-md-${12 / dynamicColumnsPerRow} mb-2`}>
                <LabelHeaderText value={intl.formatMessage({ id: "LABEL.COMPLETIONDATE" })} /> :
                <LabelHeaderText customClass="" value={data.completionDate} />
              </div>
            </div>

          </div>
        }

        {/* <div className="vertical-divider"></div> */}
      </div>
    </div>
  );
}
