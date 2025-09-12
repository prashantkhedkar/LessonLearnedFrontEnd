import useIntl from "react-intl/src/components/useIntl";
import JoditEditor from "jodit-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../../../store";
import {
  DetailLabels,
  InfoLabels,
} from "../../../../modules/components/common/formsLabels/detailLabels";
import {
  ServiceCategoryModel,
  ServiceModel,
} from "../../../../models/global/serviceModel";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import DropdownList from "../../../../modules/components/dropdown/DropdownList";
import {
  AddUpdateServiceFormDetails,
  DeleteServiceUnit,
  GetLookupValues,
  GetServiceDetailsByServiceId,
  fetchServiceCategories,
  isServiceDuplicate,
} from "../../../../modules/services/adminSlice";
import { current, unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { writeToBrowserConsole } from "../../../../modules/utils/common";
import { ILookup } from "../../../../models/global/globalGeneric";
import { ServiceUserType } from "../../../../helper/_constant/serviceUserType";
import { Box, Typography } from "@mui/material";

type props = {
  serviceId: number;
  onSuccess?: (serviceId: number) => void; // Add optional onSuccess prop
  readOnly: boolean; // Add optional readOnly prop
};
export const ServiceRequestForm = forwardRef(
  ({ onSuccess, serviceId, readOnly }: props, ref) => {
    const intl = useIntl();
    const lang = useLang();
    const dispatch = useAppDispatch();
    const {
      register,
      formState: { errors },
      control,
      handleSubmit,
      reset,
      clearErrors,
      setValue,
    } = useForm<ServiceModel>();
    const [categories, setCategories] = useState<ServiceCategoryModel[]>([]);
    const [serviceUserType, setServiceUserType] = useState<ILookup[]>([]);
    const [serviceDesc, setServiceDesc] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [descriptionError, setDescriptionError] = useState<string>("");
    const [isDescriptionMaxed, setDescriptionMaxed] = useState<boolean>(false);
    // Track if the last action was a truncating paste
    const wasTruncatedPaste = useRef(false);
    const editorRef = useRef<any>(null);
    const [maxLength, setMaxLength] = useState<number>(500);
    const [currentLength, setCurrentLength] = useState<number>(0);
    const [newServiceId, setNewServiceId] = useState<number>(0);

    // Update current length whenever serviceDesc changes
    useEffect(() => {
      setCurrentLength(getTextLength(serviceDesc));
    }, [serviceDesc]);

    const DEFAULT_JODIT_CONFIG = {
      readonly: false,
      direction: "rtl",
      toolbar: true,
      language: "ar",
      toolbarButtonSize: "medium",
      debugLanguage: true,
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: true,
      askBeforePasteFromWord: true,
      defaultActionOnPaste: "insert_clear_html",
      i18n: {
        ar: {
          "Insert as Text": "التنسيق الإفتراضي",
          Keep: "احتفظ بالتنسيق",
          Clean: "التنسيق الإفتراضي",
          "Insert only Text": "إدراج النص فقط",
          "Line height": "تباعد الأسطر",
          "Lower Alpha": "a",
          "Lower Greek": "α",
          "Lower Roman": "i",
          "Upper Alpha": "A",
          "Upper Roman": "I",
          "1": "1",
          "1.1": "1.1",
          "1.2": "1.2",
          "1.3": "1.3",
          "1.4": "1.4",
          "1.5": "1.5",
          "2": "2",
        },
      },
      placeholder: "",
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "table",
        "image",
        "|",
        "align",
        "lineHeight",
        "eraser",
        "|",
        "undo",
        "redo",
      ],
      allowCellResize: true,
      uploader: {
        insertImageAsBase64URI: true,
      },
      imageDefaultWidth: 300,
      saveModeInStorage: true,
      showPlaceholder: false,
      table: {
        rows: 8,
        cols: 8,
        styles: {
          table_default: {
            border: "1px solid #ccc",
            borderCollapse: "collapse",
          },
        },
        // Enable table column resizing
        enableResize: true,
        // Enable table cell resizing
        enableCellResize: true,
      },
      // --- Begin appended from DEFAULT_JODIT_CONFIG_2 ---
      autoFocus: false,
      allowTab: true,
      tabIndex: 1,
      tabWidth: 3,
      editorClassName: "custom-jodit-editor",
      statusbar: false,
      enter: "p" as const,
      enterBlock: "p" as const,
      paste: {
        clean: true,
        stripTags: true,
      },
      disablePlugins: ["paste"],
      // --- Merge events from both configs ---
      events: {
        beforePaste: function (html) {
          return html;
        },
        openPasteDialog: (popup) => {
          const interval = setInterval(() => {
            const pasteButton = popup.querySelector(".jodit-ui-button__text");
            if (pasteButton) {
              pasteButton.textContent = "hi";
              clearInterval(interval);
            }
          }, 100);
        },
        beforeInput: (event) => {
          const editor = event.currentTarget;
          const currentTextLength = getTextLength(editor.innerHTML);
          if (
            event.inputType === "deleteContentBackward" ||
            event.inputType === "deleteContentForward" ||
            event.inputType === "deleteWordBackward" ||
            event.inputType === "deleteWordForward" ||
            event.inputType === "deleteByCut"
          ) {
            return;
          }
          const data = event.data || "";
          if (currentTextLength + data.length > maxLength) {
            event.preventDefault();
            setDescriptionError(
              intl.formatMessage(
                { id: "VALIDATION.CHARACTER_LIMIT_REACHED" },
                { maxLength }
              )
            );
            return false;
          }
          setDescriptionError("");
          return true;
        },
        keydown: (event) => {
          const editor = event.currentTarget;
          const currentTextLength = getTextLength(editor.innerHTML);
          const allowedKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
            "PageUp",
            "PageDown",
            "Escape",
            "F1",
            "F2",
            "F3",
            "F4",
            "F5",
            "F6",
            "F7",
            "F8",
            "F9",
            "F10",
            "F11",
            "F12",
          ];
          const isCtrlKey = event.ctrlKey || event.metaKey;
          const allowedCtrlKeys = ["a", "c", "x", "z", "y"];
          if (
            allowedKeys.includes(event.key) ||
            (isCtrlKey && allowedCtrlKeys.includes(event.key.toLowerCase()))
          ) {
            return;
          }
          if (isCtrlKey && event.key.toLowerCase() === "v") {
            if (currentTextLength >= maxLength) {
              event.preventDefault();
              setDescriptionError(
                intl.formatMessage({
                  id: "VALIDATION.CHARACTER_LIMIT_REACHED_PASTE",
                })
              );
              return;
            }
          }
          const isCharacterKey = event.key.length === 1 && !isCtrlKey;
          if (currentTextLength >= maxLength && isCharacterKey) {
            event.preventDefault();
            setDescriptionError(
              intl.formatMessage(
                { id: "VALIDATION.CHARACTER_LIMIT_REACHED" },
                { maxLength }
              )
            );
            return;
          }
          if (event.key === "Enter" && currentTextLength >= maxLength) {
            event.preventDefault();
            setDescriptionError(
              intl.formatMessage(
                { id: "VALIDATION.CHARACTER_LIMIT_REACHED" },
                { maxLength }
              )
            );
            return;
          }
        },
        paste: (event) => {
          // Allow default paste (including drag-and-drop text)
          const editor = event.currentTarget;
          setTimeout(() => {
            if (!editor) return;
            const currentTextLength = getTextLength(editor.innerHTML);
            if (currentTextLength > maxLength) {
              // Truncate to maxLength
              const div = document.createElement("div");
              div.innerHTML = editor.innerHTML;
              const textContent = div.textContent || div.innerText || "";
              const truncatedText = textContent.slice(0, maxLength);
              editor.innerHTML = "";
              const textNode =
                editor.ownerDocument.createTextNode(truncatedText);
              editor.appendChild(textNode);
              setDescriptionError(
                intl.formatMessage(
                  { id: "VALIDATION.CONTENT_TRUNCATED" },
                  { maxLength }
                )
              );
            } else {
              setDescriptionError("");
            }
          }, 0);
        },
        input: (event) => {
          const editor = event.currentTarget;
          const currentTextLength = getTextLength(editor.innerHTML);
          if (currentTextLength > maxLength) {
            const div = document.createElement("div");
            div.innerHTML = editor.innerHTML;
            const textContent = div.textContent || div.innerText || "";
            const truncatedText = textContent.slice(0, maxLength);
            editor.innerHTML = "";
            const textNode = editor.ownerDocument.createTextNode(truncatedText);
            editor.appendChild(textNode);
            setDescriptionError(
              intl.formatMessage(
                { id: "VALIDATION.CONTENT_TRUNCATED" },
                { maxLength }
              )
            );
          } else {
            // Only clear error if not after a truncating paste and the flag is not set
            if (
              descriptionError &&
              !wasTruncatedPaste.current &&
              currentTextLength <= maxLength
            ) {
              setDescriptionError("");
            }
            // If the last action was a truncating paste, do NOT clear the error here
            // The error will be cleared by beforeInput/keydown on next manual user action
          }
        },
      },
      // --- End appended ---
    };

    const config = useMemo(
      () => ({
        ...DEFAULT_JODIT_CONFIG,
        readOnly: !!readOnly,
      }),
      [readOnly]
    );

    useEffect(() => {
      try {
        dispatch(fetchServiceCategories())
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const responseData =
                originalPromiseResult.data as ServiceCategoryModel[];
              setCategories(responseData);
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          });

        dispatch(GetLookupValues({ lookupType: "ServiceUserType" }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const response: ILookup[] = originalPromiseResult.data;
              setServiceUserType(response);

              loadServiceDetails();
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          });

        const loadServiceDetails = async () => {
          try {
            if (serviceId > 0) {
              setIsLoading(true);

              dispatch(GetServiceDetailsByServiceId({ serviceId }))
                .then(unwrapResult)
                .then((originalPromiseResult) => {
                  if (originalPromiseResult.statusCode === 200) {
                    const serviceModel =
                      originalPromiseResult.data as ServiceModel;

                    if (serviceModel) {
                      setValue("serviceName", serviceModel.serviceName);
                      setValue("categoryId", serviceModel.categoryId);
                      setValue(
                        "serviceDescription",
                        serviceModel.serviceDescription
                      );
                      setValue("serviceUserType", serviceModel.serviceUserType);
                      setServiceDesc(serviceModel.serviceDescription || "");

                      if (editorRef.current) {
                        editorRef.current.value =
                          serviceModel.serviceDescription;
                      }
                    }
                  }
                });
            } else {
              // For new service, set default value for serviceUserType
              setValue("serviceUserType", ServiceUserType.EndUser);
            }
          } catch (ex) {
            writeToBrowserConsole(ex);
          }
        };
      } catch (e) {
        writeToBrowserConsole(e);
      }
    }, []);

    const [serviceNameError, setServiceNameError] = useState<string>("");

    const checkForDuplicateServiceName = (serviceName: string) => {
      if (!serviceName) {
        setServiceNameError("");
        return;
      }
      dispatch(isServiceDuplicate({ serviceName, serviceId }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const isDuplicate = originalPromiseResult.data as boolean;
            if (isDuplicate) {
              setServiceNameError(
                intl.formatMessage({ id: "SERVICE.NAME.EXISTS" })
              );
            } else {
              setServiceNameError("");
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    };

    const onSubmit: SubmitHandler<ServiceModel> = async (data) => {
      try {
        let formDataObject: ServiceModel = {
          serviceId: newServiceId > 0 ? newServiceId : serviceId,
          serviceName: data.serviceName,
          categoryId: data.categoryId,
          serviceDescription: serviceDesc,
          serviceUserType: data.serviceUserType,
        };
        const result = await dispatch(
          AddUpdateServiceFormDetails({ formDataObject })
        ).then(unwrapResult);

        if (result.statusCode === 200) {
          onSuccess && onSuccess(result.data);
          toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
          reset();
          return true; // Success
        } else {
          throw new Error("Failed to save service");
        }
      } catch (error) {
        writeToBrowserConsole("Form submission error: " + error);
        return false; // Failure
      }
    };

    const onSaveAsDraft: SubmitHandler<ServiceModel> = async (data) => {
      try {
        let formDataObject: ServiceModel = {
          serviceId: newServiceId > 0 ? newServiceId : serviceId,
          serviceName: data.serviceName,
          categoryId: data.categoryId,
          serviceDescription: serviceDesc,
          serviceUserType: data.serviceUserType,
        };

        const result = await dispatch(
          AddUpdateServiceFormDetails({ formDataObject })
        ).then(unwrapResult);

        if (result.statusCode === 200) {
          setNewServiceId(result.data);
          toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
          //reset();
          return true; // Success
        } else {
          throw new Error("Failed to save service as draft");
        }
      } catch (error) {
        writeToBrowserConsole("Save as draft error: " + error);
        return false; // Failure
      }
    };

    // Helper to strip HTML tags and count only text content
    const getTextLength = (html: string) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent?.length || 0;
    };

    const handleOnChangeServiceDesc = (data: string) => {
      // Get current text length (excluding HTML tags)
      const textLength = getTextLength(data);

      if (textLength > maxLength) {
        setDescriptionError(
          `Description cannot exceed ${maxLength} characters.`
        );
        setDescriptionMaxed(true);

        // Prevent the change by returning undefined - don't update serviceDesc
        return;
      }

      // Clear errors and update state if within limit
      setDescriptionError("");
      setDescriptionMaxed(false);
      setServiceDesc(data);
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        return new Promise((resolve) => {
          handleSubmit(
            async (data) => {
              const result = await onSubmit(data);
              resolve(result);
            },
            (errors) => {
              // Form validation failed
              console.log("Form validation errors:", errors);
              resolve(false);
            }
          )();
        });
      },
      saveAsDraft: () => {
        return new Promise((resolve) => {
          handleSubmit(
            async (data) => {
              const result = await onSaveAsDraft(data);
              resolve(result);
            },
            (errors) => {
              // Form validation failed
              console.log("Form validation errors:", errors);
              resolve(false);
            }
          )();
        });
      },
    }));

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12 pxr24 user-form-container-for-card">
            <div className={`card card-flush MOD-Card user-form-mod-card`}>
              <div className="card-body border-top MOD-Cardbody-inner-pages">
                <div className="row  mb-4 p-2 align-items-center">
                  <div className="col-md-3 pt-0">
                    <InfoLabels
                      style={{}}
                      text={intl.formatMessage({ id: "LABEL.SERVICENAME" })}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-md-3 fv-row fv-plugins-icon-container">
                    {readOnly ? (
                      <DetailLabels
                        text={control._formValues?.serviceName || ""}
                      />
                    ) : (
                      <>
                        <input
                          type="text"
                          maxLength={100}
                          autoComplete="off"
                          className="form-control form-control-solid active input5 lbl-txt-medium-2"
                          placeholder={intl.formatMessage({
                            id: "LABEL.SERVICENAME",
                          })}
                          {...register("serviceName", {
                            required: intl.formatMessage({
                              id: "LABEL.SERVICENAMEREQ",
                            }),
                            onChange: (e) => {
                              setValue("serviceName", e.target.value);
                              checkForDuplicateServiceName(e.target.value);
                            },
                          })}
                          name="serviceName"
                        />
                        <div className={"error"}>
                          {errors.serviceName?.message || serviceNameError}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-md-2 fv-row fv-plugins-icon-container ml-5">
                    <InfoLabels
                      style={{}}
                      text={"LABEL.SERVICECATEGORY"}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-md-4 fv-row fv-plugins-icon-container">
                    <Controller
                      control={control}
                      name="categoryId"
                      rules={{
                        required: intl.formatMessage({
                          id: "LABEL.SERVICECATEGORYREQ",
                        }),
                      }}
                      render={({ field: { onChange, value } }) =>
                        readOnly ? (
                          <DetailLabels
                            text={
                              categories.find(
                                (cat) => cat.categoryId === value
                              )?.[
                                lang === "ar"
                                  ? "categoryNameAr"
                                  : "categoryNameEn"
                              ] || ""
                            }
                          />
                        ) : (
                          <>
                            <DropdownList
                              dataKey="categoryId"
                              dataValue={
                                lang === "ar"
                                  ? "categoryNameAr"
                                  : "categoryNameEn"
                              }
                              defaultText={intl.formatMessage({
                                id: "LABEL.SERVICECATEGORY",
                              })}
                              value={value}
                              data={categories}
                              setSelectedValue={onChange}
                            />
                            {errors.categoryId && (
                              <div className={"error"}>
                                {errors.categoryId?.message}
                              </div>
                            )}
                          </>
                        )
                      }
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-md-3 fv-row fv-plugins-icon-container">
                    <InfoLabels
                      style={{}}
                      text={"LABEL.SERVICEDESCRIPTION"}
                      isRequired={true}
                      customClassName="mb-2"
                    />
                  </div>
                  <div className="col-md-9 fv-row fv-plugins-icon-container">
                    {readOnly ? (
                      <div
                        className="form-control form-control-lg form-control-solid mb-3 mb-lg-0 readonlyClassName"
                        style={{
                          minHeight: 120,
                          background: "#f9f9f9",
                          border: "1px solid #eee",
                          borderRadius: 4,
                          padding: 8,
                        }}
                        dangerouslySetInnerHTML={{ __html: serviceDesc || "" }}
                      />
                    ) : (
                      <>
                        <JoditEditor
                          value={serviceDesc}
                          config={config as any}
                          onChange={(value) => handleOnChangeServiceDesc(value)}
                          ref={editorRef}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "4px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            {descriptionError && (
                              <div
                                style={{ color: "red", fontSize: "0.875rem" }}
                              >
                                {descriptionError}
                              </div>
                            )}
                          </div>
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Typography
                              variant="caption"
                              color={
                                currentLength >= maxLength
                                  ? "error"
                                  : "text.secondary"
                              }
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {currentLength}/{maxLength}
                            </Typography>
                          </Box>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-md-3 fv-row fv-plugins-icon-container">
                    <InfoLabels
                      style={{}}
                      text={"LABEL.SERVICE.ACCESS"}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-md-3 fv-row fv-plugins-icon-container">
                    <Controller
                      control={control}
                      name="serviceUserType"
                      rules={{
                        required: intl.formatMessage({
                          id: "LABEL.SERVICEACCESSREQ",
                        }),
                      }}
                      render={({ field: { onChange, value } }) =>
                        readOnly ? (
                          <DetailLabels
                            text={
                              serviceUserType.find(
                                (t) => t.lookupId === value
                              )?.[
                                lang === "ar" ? "lookupNameAr" : "lookupName"
                              ] || ""
                            }
                          />
                        ) : (
                          <>
                            <DropdownList
                              dataKey="lookupId"
                              dataValue={
                                lang === "ar" ? "lookupNameAr" : "lookupName"
                              }
                              defaultText={intl.formatMessage({
                                id: "LABEL.SERVICE.ACCESS",
                              })}
                              value={value}
                              data={serviceUserType}
                              setSelectedValue={onChange}
                            />
                            {errors.categoryId && (
                              <div className={"error"}>
                                {errors.serviceUserType?.message}
                              </div>
                            )}
                          </>
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
);
