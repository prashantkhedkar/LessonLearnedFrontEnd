import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../store";
import ObservationBody from "./ObservationBody";
import AttachmentForm from "./AttachmentForm";
import { fetchObservationById } from "../../modules/services/observationSlice";
import { writeToBrowserConsole } from "../../modules/utils/common";
import ComponentShowcase from "../../modules/components/ComponentShowcase/ComponentShowcase";
import ObservationDetailWidget from "../../modules/components/common/PageHeader/ObservationDetailWidget";
import Recommendation from "../components/Recommendation";
import { useObservationRedux } from "../hooks/useObservationRedux";
import { useRBAC } from "../../modules/auth/core/rbac";
import { UserRoles } from "../../modules/auth/core/_rbacModels";
import { ObservationStatus } from "../../helper/_constant/status.constant";
import StatusUpdateModal from "../components/StatusUpdateModal";
import { BtnLabeltxtMedium2 } from "../../modules/components/common/formsLabels/detailLabels";

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
  const navigate = useNavigate();
  const rbac = useRBAC();
  const observationRedux = useObservationRedux();

  const [loading, setLoading] = useState<boolean>(true);
  const [tabInit, setTabInit] = useState(0);
  const [result, setResult] = useState<ObservationFormData>();
  const location = useLocation();
  const state = location.state as { tab: number; observationId: number; readOnly?: boolean };
  const [observationId, setObservationId] = useState<number>(0);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    action: 'approve' | 'reject' | 'return';
    title: string;
    actionLabel: string;
    statusId: number;
    requireRemarks: boolean;
  } | null>(null);

  // Check if user is Battalion Commander and observation status is Submitted
  const canShowActionButtons = () => {
    const isBattalionCommander = rbac.hasRoleByName(UserRoles.BATTALIONCOMMANDER);
    const isSubmittedStatus = result?.status === ObservationStatus.Submitted;

    console.log('Battalion Commander Actions Debug:', {
      isBattalionCommander,
      isSubmittedStatus,
      currentStatus: result?.status,
      expectedStatus: ObservationStatus.Submitted,
      userRoles: rbac.getRoleDisplayNames('en')
    });

    return isBattalionCommander && isSubmittedStatus;
  };

  // Handle approve action - show modal
  const handleApprove = () => {
    setModalConfig({
      action: 'approve',
      title: intl.formatMessage({ id: "MODAL.APPROVE.TITLE" }) || "Approve Observation",
      actionLabel: intl.formatMessage({ id: "BUTTON.APPROVE" }) || "Approve",
      statusId: ObservationStatus.ApprovedByCommander,
      requireRemarks: false
    });
    setShowModal(true);
  };

  // Handle reject action - show modal
  const handleReject = () => {
    setModalConfig({
      action: 'reject',
      title: intl.formatMessage({ id: "MODAL.REJECT.TITLE" }) || "Reject Observation",
      actionLabel: intl.formatMessage({ id: "BUTTON.REJECT" }) || "Reject",
      statusId: ObservationStatus.RejectedByCommander,
      requireRemarks: true
    });
    setShowModal(true);
  };

  // Handle return action - show modal
  const handleReturn = () => {
    setModalConfig({
      action: 'return',
      title: intl.formatMessage({ id: "MODAL.RETURN.TITLE" }) || "Return Observation",
      actionLabel: intl.formatMessage({ id: "BUTTON.RETURN" }) || "Return",
      statusId: ObservationStatus.ReturnedByCommander,
      requireRemarks: true
    });
    setShowModal(true);
  };

  // Handle modal confirmation with remarks
  const handleModalConfirm = async (remarks: string) => {
    if (!observationId || !modalConfig) return;

    setActionLoading(modalConfig.action);
    try {
      const result = await observationRedux.updateObservationStatus(
        observationId,
        modalConfig.statusId,
        remarks || undefined
      );
      const response = unwrapResult(result);

      if (response.statusCode === 200) {
        const successMessageKey = `MESSAGE.OBSERVATION.${modalConfig.action.toUpperCase()}.SUCCESS`;
        const defaultMessage = `Observation ${modalConfig.action}d successfully`;
        toast.success(intl.formatMessage({ id: successMessageKey }) || defaultMessage);
        // Refresh observation data
        window.location.reload();
      } else {
        const errorMessageKey = `MESSAGE.OBSERVATION.${modalConfig.action.toUpperCase()}.FAILED`;
        const defaultMessage = `Failed to ${modalConfig.action} observation`;
        toast.error(intl.formatMessage({ id: errorMessageKey }) || defaultMessage);
      }
    } catch (error) {
      console.error(`Error ${modalConfig.action}ing observation:`, error);
      const errorMessageKey = `MESSAGE.OBSERVATION.${modalConfig.action.toUpperCase()}.FAILED`;
      const defaultMessage = `Failed to ${modalConfig.action} observation`;
      toast.error(intl.formatMessage({ id: errorMessageKey }) || defaultMessage);
    } finally {
      setActionLoading(null);
      setShowModal(false);
      setModalConfig(null);
    }
  };

  // Handle cancel action - just navigate back to list
  const handleCancel = () => {
    navigate('/observation/observation-list');
  };

  useEffect(() => {
    if (location.state) {
      const locationState = JSON.parse(JSON.stringify(location.state));
      const observationId = locationState.observationId || 0;
      const readOnly = locationState.readOnly || false;

      setObservationId(observationId);
      setIsReadOnly(readOnly);

      dispatch(fetchObservationById({ articleId: observationId }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            setResult(originalPromiseResult.data);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    }
  }, [dispatch, location.state]);

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

      {tabInit === 1 && <AttachmentForm observationID={observationId} readOnly={isReadOnly} />}

      {tabInit === 2 && <Recommendation observationId={observationId} readOnly={isReadOnly} />}

      {/* Action buttons for Battalion Commander */}
      {canShowActionButtons() && (
        <div className="card mt-4">
          {/* <div className="card-header">
            <h5 className="card-title mb-0">
              {intl.formatMessage({ id: "LABEL.BATTALION.COMMANDER.ACTIONS" }) || "Battalion Commander Actions"}
            </h5>
          </div> */}
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3 justify-content-end">
              <button
                type="button"
                className="btn MOD_btn2 stepper-bottom-btn m-0 approve-btn"
                style={{ minWidth: 120 }}
                onClick={handleApprove}
                disabled={actionLoading !== null}
              >

                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.APPROVE"}
                />
              </button>

              <button
                type="button"
                className="btn MOD_btn2 stepper-bottom-btn m-0 reject-btn"
                style={{ minWidth: 120 }}
                onClick={handleReject}
                disabled={actionLoading !== null}
              >

                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.REJECT"}
                />
              </button>

              <button
                type="button"
                className="btn MOD_btn2 stepper-bottom-btn m-0 return-btn"
                style={{ minWidth: 120 }}
                onClick={handleReturn}
                disabled={actionLoading !== null}
              >

                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.RETURN1"}
                />
              </button>

              <button
                type="button"
                className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                style={{ minWidth: 120 }}
                onClick={handleCancel}
              >

                <BtnLabeltxtMedium2
                  customClassName="MOD_btn2_Label"
                  isI18nKey={true}
                  text={"BUTTON.CANCEL"}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {modalConfig && (
        <StatusUpdateModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setModalConfig(null);
          }}
          onConfirm={handleModalConfirm}
          title={modalConfig.title}
          actionLabel={modalConfig.actionLabel}

          requireRemarks={modalConfig.requireRemarks}
        />
      )}
    </>
  );
}
