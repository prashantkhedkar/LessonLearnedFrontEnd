import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";

import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../store";
import ObservationBody from "./ObservationBody";
import AttachmentForm from "./AttachmentForm";
import { fetchObservationById } from "../../modules/services/observationSlice";
import { writeToBrowserConsole } from "../../modules/utils/common";
import ComponentShowcase from "../../modules/components/ComponentShowcase/ComponentShowcase";
import ObservationDetailWidget from "../../modules/components/common/PageHeader/ObservationDetailWidget";
 import Recommendation from "../components/Recommendation";

 export interface ObservationFormData {
   observationTitle: string;
   observationSubject?: string;
   discussion?: string;
   conclusion?: string;
   initialRecommendation?: string;
   observationType?: number | null;
   originatingType?: number | null;
   level?: number | null;
   combatFunction?: number | null;
   currentAssignment?: string;
   status: number;

   observationTypeLookupNameAr?: string;
   originatingTypeLookupNameAr?: string;
   combatFunctionLookupNameAr?: string;
   LevelLookupNameAr?: string;
   statusNameAr?: string;
 }

 export default function ObservationDetailsPage() {
   const intl = useIntl();
   const dispatch = useAppDispatch();

   const [loading, setLoading] = useState<boolean>(true);
   const [tabInit, setTabInit] = useState(0);
   const [result, setResult] = useState<ObservationFormData>();

   const location = useLocation();
   const state = location.state as { tab: number };

   useEffect(() => {
     dispatch(fetchObservationById({ articleId: 5 }))
       .then(unwrapResult)
       .then((originalPromiseResult) => {
         if (originalPromiseResult.statusCode === 200) {
           setResult(originalPromiseResult.data);
         }
       })
       .catch((rejectedValueOrSerializedError) => {
         writeToBrowserConsole(rejectedValueOrSerializedError);
       });
   }, [dispatch]);

   const TabStyle: React.CSSProperties = {
     display: "inline-block",
     padding: "12px 24px",
     cursor: "pointer",
     border: "none",
     outline: "none",
     background: "transparent",
     color: "#555",
     transition: "color 0.2s",
     fontFamily: "FrutigerLTArabic-Roman_0",
     fontSize: "0.875rem",
     fontWeight: "bold",
     borderBottom: "none",
   };

   const activeTabStyle: React.CSSProperties = {
     ...TabStyle,
     color: "rgb(107, 114, 128)",
     borderBottom: "solid #ccc 1px",
     fontWeight: 600,
     boxShadow: "0px 2px 0px 0px #B7945A",
   };

   const tabListStyle: React.CSSProperties = {
     display: "flex",
     borderBottom: "1px solid #e0e0e0",
     gap: 2,
     marginBottom: "2rem",
   };

   return (
     <>
       <ObservationDetailWidget
         observationData={result}
         showBackButton={true}
       />
       <div style={tabListStyle} className="mb-3 mt-5">
         <button
           onClick={() => setTabInit(0)}
           style={tabInit === 0 ? activeTabStyle : TabStyle}
         >
           {intl.formatMessage({ id: "LABEL.DETAILS" })}
         </button>
         <button
           onClick={() => setTabInit(1)}
           style={tabInit === 1 ? activeTabStyle : TabStyle}
         >
           {intl.formatMessage({ id: "LABEL.ATTACHMENTS" })}
         </button>
         <button
           onClick={() => setTabInit(2)}
           style={tabInit === 1 ? activeTabStyle : TabStyle}
         >
           {intl.formatMessage({ id: "LABEL.FIXINGPROCEDURES" })}
         </button>
       </div>

       {tabInit === 0 && (
         <ObservationBody
           values={{
             discussion: result?.discussion ?? "",
             conclusion: result?.conclusion ?? "",
             initialRecommendation: result?.initialRecommendation ?? "",
           }}
         />
       )}

       {tabInit === 1 && <AttachmentForm observationID={5} />}

       {tabInit === 2 && <Recommendation observationId={5} />}
     </>
   );
 }
