import { useIntl } from "react-intl";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "../../../../../store";
import { useNavigate } from "react-router";
import { unwrapResult } from "@reduxjs/toolkit";
import WYSIWYGEditor from "../../../../modules/components/editor/WYSIWYGEditor";
import { stripHtml } from "string-strip-html";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import ModulesConstant, {
  ApplicationConstant,
  ModuleRoleAction,
  ModulesAttachmentConstant,
  ModulesNameConstant,
} from "../../../../helper/_constant/modules.constant";
import {
  calculateDaysBetweenTwoDates,
  checkSpecialCharForDateText,
  checkSpecialCharForInputText,
  generateUUID,
  writeToBrowserConsole,
} from "../../../../modules/utils/common";
import { toast } from "react-toastify";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  DetailLabels,
  HeaderLabels,
  InfoLabels,
  LabelTitleSemibold1,
} from "../../../../modules/components/common/formsLabels/detailLabels";
import CardHeaderLabel from "../../../../modules/components/common/CardHeaderLabel/cardHeaderLabel";

import {
  addUpdateUnit,
  fetchLookupAsync,
  fetchMainUnitListAsync,
  globalActions,
  uploadAttachmentChunkCompleteMediaCenterItemAsync,
} from "../../../../modules/services/globalSlice";
import { useAuth } from "../../../../modules/auth";
import CommonConstant from "../../../../helper/_constant/common.constant";

import { MIMEConstant_Announcment } from "../../../../helper/_constant/mime.constant";

import {
  IAttachment,
  IAttachmentMediaCenter,
  ILookup,
  IUnits,
} from "../../../../models/global/globalGeneric";
import UserAttachmentUploadButton from "../../../../modules/components/userAttachment/UserAttachmentUploadButton";
import { MUIDatePicker } from "../../../../modules/components/datePicker/MUIDatePicker";
import {
  IAdvertisement,
  advertisementInitValue,
} from "../../../../models/landingPageAdmin/LandingPageModel";
import DropdownListInModal from "../../../../modules/components/dropdown/DropdownListInModal";
import { L10n, setCulture } from "@syncfusion/ej2-base";

// Lazy load RichTextEditor to reduce initial bundle size
const LazyRichTextEditor = lazy(() =>
  import("../../../../components/LazyRichTextEditor").then((module) => ({
    default: ({ children, ...props }: any) => (
      <module.RichTextEditorComponent {...props}>
        <module.Inject
          services={[
            module.Toolbar,
            module.Image,
            module.Link,
            module.HtmlEditor,
            module.QuickToolbar,
            module.Table,
            module.PasteCleanup,
          ]}
        />
      </module.RichTextEditorComponent>
    ),
  }))
);

// Type definition for ref
type RichTextEditorRef = any;
import AdvertisementPreview from "./AdvertisementPreview";
import {
  fetchAdvertisementInformationAsync,
  saveAdvertisementDetails,
} from "../../../../modules/services/settingSlice";
import moment from "moment";
import { string } from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { HtmlTooltip } from "../../../../new-design/components/tooltip/HtmlTooltip";

interface props {
  setShow: any;
  onAddEditRecord: any;
  recordId: number;
}
export default function AddEditAdevrtisementForm({
  setShow,
  onAddEditRecord,
  recordId,
}: props) {
  const urlRegex =
    /^(http(s)?):\/\/(www\.)?[a-zA-Z0-9-@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%-_\+.~#?&//=]*)/gi;
  const intl = useIntl();
  const lang = useLang();
  const { auth } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [hasDateError, setDateError] = useState<boolean>(false);

  const editorRef = useRef<RichTextEditorRef | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<IAdvertisement>(
    advertisementInitValue
  );
  const [headerRichValue, setRichHeaderValue] = useState("");
  const [bgMediaUrl, setBgMediaUrl] = useState<any>("");
  const [fileType, setFileType] = useState("");
  const { viewLookups } = useAppSelector((s) => s.globalgeneric);
  const [suggestionLookups, setSuggestionLookups] = useState<ILookup[] | []>(
    []
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    setValue,
    clearErrors,
    setError,
    getValues,
    trigger,
  } = useForm<IAdvertisement>({
    criteriaMode: "all",
    reValidateMode: "onChange",
    mode: "onChange",
  });
  setCulture("ar");
  L10n.load({
    ar: {
      richtexteditor: {
        alignments: "محاذاة",
        justifyLeft: "محاذاة لليسار",
        justifyCenter: "توسيط",
        justifyRight: "محاذاة لليمين",
        justifyFull: "ضبط",
        fontName: "اختر الخط",
        fontSize: "اختر الحجم",
        fontColor: "لون الخط",
        backgroundColor: "لون الخلفية",
        bold: "عريض",
        italic: "مائل",
        underline: "تحته خط",
        strikethrough: "يتوسطه خط",
        clearFormat: "مسح التنسيق",
        clearAll: "مسح الكل",
        cut: "قص",
        copy: "نسخ",
        paste: "لصق",
        unorderedList: "قائمة نقطية",
        orderedList: "قائمة مرقمة",
        indent: "زيادة المسافة البادئة",
        outdent: "تقليل المسافة البادئة",
        undo: "تراجع",
        redo: "إعادة",
        superscript: "مرتفع",
        subscript: "منخفض",
        createLink: "إدراج رابط",
        openLink: "فتح الرابط",
        editLink: "تحرير الرابط",
        removeLink: "إزالة الرابط",
        placeHolder: "ابدأ الكتابة هنا...",
        tableHeader: "رأس الجدول",
        tableRemove: "حذف الجدول",
        tableCellHorizontalSplit: "تقسيم الخلية أفقياً",
        tableCellVerticalSplit: "تقسيم الخلية عمودياً",
        tableInsertRowBefore: "إدراج صف قبل",
        tableInsertRowAfter: "إدراج صف بعد",
        tableInsertColumnBefore: "إدراج عمود قبل",
        tableInsertColumnAfter: "إدراج عمود بعد",
        tableDeleteRow: "حذف الصف",
        tableDeleteColumn: "حذف العمود",
        createTable: "إنشاء جدول",
        tableInsertTable: "إنشاء جدول",
        image: "صورة",
        imageUrl: "رابط الصورة",
        imageBrowser: "تصفح الصور",
        imageUploadMessage: "اسحب الصورة هنا أو انقر للتصفح",
        imageDeviceUploadMessage: "انقر هنا للتصفح",
        imageAlternateText: "نص بديل",
        alternateHeader: "نص بديل",
        browse: "تصفح",
        upload: "رفع",
        cancel: "إلغاء",
        saveButton: "حفظ",
        save: "حفظ",
        urlTextBox: "رابط",
        textToDisplay: "النص المعروض",
        openInNewWindow: "فتح في نافذة جديدة",
        print: "طباعة",
        fullScreen: "ملء الشاشة",
        sourceCode: "الكود المصدري",
        formats: "التنسيقات",
        numberFormatListNumber: "قائمة مرقمة",
        bulletFormatListBullet: "قائمة نقطية",
        "insert-table": "hello",
        Insert: "hello",
        INSERT: "helloi",
      },
    },
  });

  useEffect(() => {
    if (recordId > 0) {
      dispatch(fetchAdvertisementInformationAsync({ Id: recordId }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as IAdvertisement;
            if (responseData && responseData.advertisementTitle != "") {
              setValue("advertisementType", responseData.advertisementType);
              setValue("advertisementTitle", responseData.advertisementTitle);
              setValue(
                "advertisementDescription",
                responseData.advertisementDescription
              );
              setValue("startDate", responseData.startDate);
              setValue("advertisementLink", responseData.advertisementLink);
              setValue(
                "isAdvertisementClickable",
                responseData.isAdvertisementClickable
              );
              setValue("redirectURL", responseData.redirectURL);
              setValue("active", responseData.active);
              setValue("backgroundImage", responseData.backgroundImage);
              setValue(
                "showPopupAfterDismissed",
                responseData.showPopupAfterDismissed
              );
              setValue("fileType", responseData.fileType);
              debugger;
              if (responseData.advertisementDescription != "") {
                if (editorRef && editorRef.current) {
                  editorRef.current.value =
                    responseData.advertisementDescription!;
                }

                setValue(
                  "advertisementDescription",
                  responseData.advertisementDescription
                );
              }

              if (responseData.advertisementStartDate) {
                var startDate = moment(responseData.advertisementStartDate);
                var outputStartDate = Date.parse(
                  startDate ? startDate.toString() : ""
                );
                setStartDate(new Date(outputStartDate)); // For Rendering on React component
                setValue("startDate", new Date(outputStartDate).toString()); // For Submission back to API
              }

              if (responseData.advertisementEndDate) {
                var endDate = moment(responseData.advertisementEndDate);
                var outputEndDate = Date.parse(
                  endDate ? endDate.toString() : ""
                );
                setEndDate(new Date(outputEndDate)); // For Rendering on React component
                setValue("endDate", new Date(outputEndDate).toString()); // For Submission back to API
              }
            }
          }
        });
    }
  }, [recordId, dispatch]);

  useEffect(() => {
    setValue("advertisementType", "1");
    setValue("active", true);
    const fetchData = async () => {
      debugger;

      await dispatch(
        fetchLookupAsync({ servicetype: CommonConstant.LANDINGSERVICE })
      )
        .then(unwrapResult)
        .then((result) => {
          if (result.statusCode === 200) {
            setSuggestionLookups(result.data);
          }
        });
      //}
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(globalActions.updateUserAttachment({ data: [], action: "init" }));
  }, [dispatch]);

  const handleOnSubmitUserFormData: SubmitHandler<IAdvertisement> = (data) => {
    debugger;
    let advertisementDescription = "";
    if (editorRef && editorRef.current) {
      if (editorRef.current?.value != null) {
        setValue("advertisementDescription", editorRef.current?.value);
        advertisementDescription = editorRef.current?.value;
        setRichHeaderValue(editorRef.current?.value);
      }
    }

    if (Number(data.advertisementType) === 2) {
      if (
        advertisementDescription == undefined ||
        advertisementDescription == ""
      ) {
        if (stripHtml(advertisementDescription).result.length == 0) {
          toast.error(
            intl.formatMessage({
              id: "MOD.SETTING.ADVERTISEMENT.ADVERTISEMENTCONTENTREQUIRED",
            })
          );
        }

        return;
      }

      if (stripHtml(advertisementDescription).result.length == 0) {
        toast.error(
          intl.formatMessage({
            id: "MOD.SETTING.ADVERTISEMENT.ADVERTISEMENTCONTENTREQUIRED",
          })
        );

        return;
      }
    }
    if (!showPreview) {
      if (data.advertisementType === "1") {
        if (
          data.advertisementLink == undefined ||
          data.advertisementLink == ""
        ) {
          setError("advertisementLink", {
            type: "required",
            message: intl.formatMessage({
              id: "MOD.ANNOUNCEMENT.REDIRECTURLISREQUIRED",
            }),
          });
          return;
        }
      }
      if (hasDateError) {
        setError("startDate", {
          type: "custom",
          message: intl.formatMessage({ id: "MOD.WATIRA.INVALIDDATERANGE" }),
        });
        setError("endDate", {
          type: "custom",
          message: intl.formatMessage({ id: "MOD.WATIRA.INVALIDDATERANGE" }),
        });
      }

      if (
        data.isAdvertisementClickable &&
        (!data.redirectURL || data.redirectURL === "")
      ) {
        setError("redirectURL", {
          type: "required",
          message: intl.formatMessage({
            id: "MOD.ANNOUNCEMENT.REDIRECTURLISREQUIRED",
          }),
        });
        return;
      }

      try {
        // setIsSubmitCompleted(false);
        let formDataObject = advertisementInitValue;
        formDataObject = {
          ...advertisementInitValue,
          id: recordId,
          advertisementTitle: data.advertisementTitle,
          advertisementDescription: advertisementDescription, //data.advertisementDescription,
          startDate: data.startDate,
          endDate: data.endDate,
          advertisementType: data.advertisementType,
          advertisementLink: data.advertisementLink,
          backgroundImage: data.backgroundImage,
          active: data.active,
          showPopupAfterDismissed: data.showPopupAfterDismissed,
          fileType: data.fileType,
          isAdvertisementClickable: data.isAdvertisementClickable,
          redirectURL: data.redirectURL,
        };

        dispatch(saveAdvertisementDetails({ formDataObject: formDataObject }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              if (originalPromiseResult.data == 1) {
                toast.success(
                  intl.formatMessage({
                    id: "MOD.SETTING.ADVERTISEMENT.SAVE",
                  })
                );
                setShow(false);
                onAddEditRecord(recordId);
              } else if (originalPromiseResult.data == 2) {
                toast.warning(
                  intl.formatMessage({
                    id: "MOD.MANAGESETTING.BACKGROUND.SUBMISSIONNOTVALID",
                  })
                );
                setError("startDate", {
                  type: "custom",
                  message: intl.formatMessage({
                    id: "MOD.PROJECTMANAGEMENT.INVALIDDATERANGE",
                  }),
                });
                setError("endDate", {
                  type: "custom",
                  message: intl.formatMessage({
                    id: "MOD.PROJECTMANAGEMENT.INVALIDDATERANGE",
                  }),
                });
                setEndDate(undefined);
                setValue("endDate", "");
              } else if (originalPromiseResult.data == 3) {
                toast.warning(
                  intl.formatMessage({
                    id: "MOD.MANAGESETTING.BACKGROUND.SUBMISSIONNOTVALIDNAME",
                  })
                );
              }
            } else {
              if (originalPromiseResult.statusCode === 401) {
                onAddEditRecord(recordId);
                navigate("/auth");
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            console.log(rejectedValueOrSerializedError);
            // setIsSubmitCompleted(true);
          });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const OnChangeRichHeader = (data: string) => {
    alert("aaaaaaaaaa");
    const output = JSON.parse(JSON.stringify(data));
    setRichHeaderValue(output);
    if (editorRef && editorRef.current) {
      setValue("advertisementDescription", editorRef.current?.value);
      setRichHeaderValue(editorRef.current?.value);
    }
  };

  const onPreviewClick = async () => {
    if (editorRef && editorRef.current) {
      setValue("advertisementDescription", editorRef.current?.value);
    }
    const data = getValues();

    let _previewData = advertisementInitValue;
    _previewData = {
      ...advertisementInitValue,
      id: 0,
      advertisementTitle: data.advertisementTitle,
      advertisementDescription: data.advertisementDescription,
      advertisementStartDate: data.advertisementStartDate,
      advertisementEndDate: data.advertisementEndDate,
      advertisementType: data.advertisementType,
      advertisementLink: data.advertisementLink,
      fileType: data.fileType,
      backgroundImage: data.backgroundImage,
      isAdvertisementClickable: data.isAdvertisementClickable,
      redirectURL: data.redirectURL,
    };

    setPreviewData(_previewData);
    setShowPreview(true);
  };

  const handleOnUploadAttachmentChunksComplete = (formObject: IAttachment) => {
    //  setDisableSubmit(true);
    try {
      let newformObject: IAttachmentMediaCenter = {
        moduleId: "0",
        moduleTypeId: ModulesAttachmentConstant.ANNOUNCEMENTADMIN,
        unitId: "0",
        fileName: formObject.fileName!,
        fileType: formObject.fileType!,
        applicationId: ApplicationConstant.JointPortal,
        docUrl: "",
        chunkFileReferenceGuid: formObject.chunkFileReferenceGuid
          ? formObject.chunkFileReferenceGuid
          : "",
      };

      dispatch(
        uploadAttachmentChunkCompleteMediaCenterItemAsync({
          formDataObject: newformObject,
        })
      )
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.responseCode === 1) {
            const responseData = originalPromiseResult.data;
            if (responseData) {
              setBgMediaUrl(responseData.docUrl);
              setValue("advertisementLink", responseData.docUrl);
              clearErrors("advertisementLink");

              setFileType(formObject.fileType!);
              setValue("fileType", formObject.fileType!);
              toast.success(
                intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCUPLSUC" })
              );
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        })
        .finally(() => {
          const loaderMessage =
            "LoadingToastr" +
            formObject.fileName?.replaceAll(" ", "_").toString();
          //  setDisableSubmit(false);
          toast.dismiss(loaderMessage);
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  const handleOnUploadBGAttachmentChunksComplete = (
    formObject: IAttachment
  ) => {
    //  setDisableSubmit(true);
    try {
      let newformObject: IAttachmentMediaCenter = {
        moduleId: "0",
        moduleTypeId: ModulesAttachmentConstant.ANNOUNCEMENTADMIN,
        unitId: "0",
        fileName: formObject.fileName!,
        fileType: formObject.fileType!,
        applicationId: ApplicationConstant.JointPortal,
        docUrl: "",
        chunkFileReferenceGuid: formObject.chunkFileReferenceGuid
          ? formObject.chunkFileReferenceGuid
          : "",
      };

      dispatch(
        uploadAttachmentChunkCompleteMediaCenterItemAsync({
          formDataObject: newformObject,
        })
      )
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.responseCode === 1) {
            const responseData = originalPromiseResult.data;
            if (responseData) {
              setBgMediaUrl(responseData.docUrl);
              setValue("backgroundImage", responseData.docUrl);
              clearErrors("backgroundImage");

              setFileType(formObject.fileType!);
              setValue("fileType", formObject.fileType!);
              toast.success(
                intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCUPLSUC" })
              );
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        })
        .finally(() => {
          const loaderMessage =
            "LoadingToastr" +
            formObject.fileName?.replaceAll(" ", "_").toString();
          //  setDisableSubmit(false);
          toast.dismiss(loaderMessage);
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Disabled Save button during file upload
  const handleDisableSubmitAction = (data: boolean) => {
    // setDisableSubmit(data);
  };

  const onDropDownChange = (fielName: any, value: any) => {
    setValue(fielName, value);
    clearErrors(fielName);

    setBgMediaUrl("");
    clearErrors("advertisementLink");
    setValue("advertisementLink", "");
    setValue("backgroundImage", "");
    if (value === 1) {
      setError("advertisementLink", {
        type: "required",
        message: intl.formatMessage({
          id: "MOD.ANNOUNCEMENT.REDIRECTURLISREQUIRED",
        }),
      });
    }
    // clearErrors("advertisementDescription");
    // if (editorRef.current) {
    //   editorRef.current?.refresh();
    // }
    // setValue("advertisementDescription", "");

    clearErrors(fielName);
  };

  const onChangeIsBannerClickable = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue("isAdvertisementClickable", event.target.checked);
    if (event.target.checked) {
      setError("redirectURL", {
        type: "required",
        message: intl.formatMessage({
          id: "MOD.ANNOUNCEMENT.REDIRECTURLISREQUIRED",
        }),
      });
    } else {
      clearErrors("redirectURL");
    }
  };

  const onChangeShowPopupAllTimeClickable = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue("showPopupAfterDismissed", event.target.checked);
  };

  const handleURLValidation = (e: any) => {
    if (e.target.value) {
      if (!urlRegex.test(e.target.value)) {
        setError("redirectURL", {
          type: "custom",
          message: intl.formatMessage({
            id: "MOD.NEWS.INVALIDURL",
          }),
        });
        // setFocus("redirectURL");
        return false;
      } else {
        clearErrors("redirectURL");
        return true;
      }
    }
  };

  const handleOnChangeStartDate = (date: Date) => {
    try {
      // Draft record validation for project start date
      setStartDate(date);
      setValue("startDate", date.toString());

      if (endDate && date) {
        if (calculateDaysBetweenTwoDates(endDate, date) === "N/a") {
          setError("startDate", {
            type: "custom",
            message: intl.formatMessage({
              id: "MOD.PROJECTMANAGEMENT.INVALIDDATERANGE",
            }),
          });
          setError("endDate", {
            type: "custom",
            message: intl.formatMessage({
              id: "MOD.PROJECTMANAGEMENT.INVALIDDATERANGE",
            }),
          });
          setEndDate(undefined);
          setValue("endDate", "");
        } else {
          clearErrors("startDate");
          clearErrors("endDate");
        }
      }
    } catch (e) {
      console.log("Error at handleOnChangeStartDate " + e);
    }
  };

  const handleOnChangeEndDate = (date: Date) => {
    try {
      setEndDate(date);
      setValue("endDate", date.toString());

      if (date && startDate) {
        if (calculateDaysBetweenTwoDates(date, startDate) === "N/a") {
          setError("startDate", {
            type: "custom",
            message: intl.formatMessage({
              id: "MOD.PROJECTMANAGEMENT.INVALIDDATERANGE",
            }),
          });
          setError("endDate", {
            type: "custom",
            message: intl.formatMessage({
              id: "MOD.PROJECTMANAGEMENT.INVALIDDATERANGE",
            }),
          });
        } else {
          clearErrors("startDate");
          clearErrors("endDate");
        }
      }
    } catch (e) {
      console.log("Error at handleOnChangeEndDate " + e);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleOnSubmitUserFormData)}
        className="form"
        autoComplete="off"
      >
        <div className="row">
          <div className="col-lg-12">
            {/* Advertisement Title */}
            <div className="row">
              <div className="col-md-8">
                <InfoLabels
                  isRequired
                  text={"MOD.SETTING.ADVERTISEMENT.TITLE"}
                  customClassName="mb-2"
                ></InfoLabels>
                <input
                  type="text"
                  className={`form-control form-control-solid active input5 lbl-txt-medium-2`}
                  placeholder={intl.formatMessage({
                    id: "MOD.ANNOUNCEMENT.TITLE",
                  })}
                  {...register("advertisementTitle", {
                    required: intl.formatMessage({
                      id: "MOD.ANNOUNCEMENT.TITLEREQUIRED",
                    }),
                    maxLength: {
                      value: 50,
                      message:
                        intl.formatMessage({
                          id: "MOD.PROJECTMANAGEMENT.VALIDATION.MAXCHARLIMIT",
                        }) + " 50",
                    },
                  })}
                  onKeyDown={(e) => checkSpecialCharForInputText(e, lang)}
                />
                <div className={"error"}>
                  {errors.advertisementTitle?.message}
                </div>
              </div>
              <div className="col-md-4">
                <div>
                  <InfoLabels
                    isI18nKey
                    text="MOD.SETTING.ADVERTISEMENT.ACTIVE"
                  />
                </div>
                <div
                  className={
                    lang === "ar"
                      ? "border-0 form-check-reverse form-check-input col-md-9"
                      : "col-md-9 fv-row"
                  }
                >
                  <div className="form-check form-switch px-4 pt-5">
                    <input
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      id={`menu-checkbox-1`}
                      {...register("active")}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Media Upload */}
            <div className="row pt-4">
              <div className="col-6">
                {/* {getValues("advertisementType")}
                {" fileType==> " + getValues("fileType")} */}
                <DetailLabels
                  style={{}}
                  customClassName="mb-2"
                  text={"MOD.SETTING.ADVERTISEMENT.ADVERTISEMENTTYPE"}
                  isRequired={true}
                />

                <Controller
                  control={control}
                  name="advertisementType"
                  rules={{}}
                  render={({ field: { value } }) => (
                    <DropdownListInModal
                      dataKey="lookupId"
                      dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                      defaultText={intl.formatMessage({
                        id: "MOD.SUGGESTIONMODAL.LABEL.IMPACTDEFAULT",
                      })}
                      value={value}
                      data={
                        suggestionLookups &&
                        suggestionLookups!.filter((item) => {
                          return item.lookupType === "Advertisement";
                        })
                      }
                      setSelectedValue={(e) =>
                        onDropDownChange("advertisementType", e)
                      }
                    />
                  )}
                />

                <div className="error">{errors.advertisementType?.message}</div>
              </div>
              <div className="col-md-6 fv-row fv-plugins-icon-container">
                <div hidden={!(Number(getValues("advertisementType")) === 1)}>
                  <InfoLabels
                    style={{}}
                    text={"MOD.SETTING.ADVERTISEMENT.ADVERTISEMENTFILE"}
                    isI18nKey={true}
                    isRequired={false}
                    customClassName="mb-2"
                  />
                  {/* {" bgMediaUrl==> " + getValues("advertisementLink")} */}
                  <div className="mb-3">
                    <UserAttachmentUploadButton
                      recordId={0}
                      buttonLayout="DragNDrop-LandingPage"
                      showUpload={true}
                      allowMultipleFileUpload={false}
                      limitToSingleAttachment={true}
                      showUploadTooltip={true}
                      uploadTooltip={""}
                      showFileTypes={true}
                      moduleTypeId={ModulesConstant.ADVERTISEMENT}
                      fileTypes={MIMEConstant_Announcment}
                      perFileMaxAllowedSizeInMb={3}
                      perFileMaxAllowedChunkSizeToSplitInMb={15}
                      onUploadAttachmentChunksComplete={
                        handleOnUploadAttachmentChunksComplete
                      }
                      onDisableSubmitAction={handleDisableSubmitAction}
                      storageServer={"mediaserver"}
                      maxLimitForDragNDropUpload={1}
                    />
                  </div>
                  <div className={"error"}>
                    {errors.advertisementLink?.message}
                  </div>
                </div>
              </div>
            </div>
            {/* Advertisement Content */}
            {/* {Number(getValues("advertisementType")) === 2 && ( */}
            <>
              <div className="row pt-4">
                <div className="col-lg-12">
                  {/* {"advertisementDescription==> " +
                    getValues("advertisementDescription")}
                  {"pp=> " + headerRichValue} */}
                  <div hidden={!(Number(getValues("advertisementType")) === 2)}>
                    <InfoLabels
                      text={"MOD.SETTING.ADVERTISEMENT.ADVERTISEMENTCONTENT"}
                      customClassName="mb-2"
                    ></InfoLabels>
                    <Suspense
                      fallback={
                        <div className="text-center p-5">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          جاري تحميل المحرر...
                        </div>
                      }
                    >
                      <LazyRichTextEditor
                        onChange={(e: any) => OnChangeRichHeader(e)}
                        pasteCleanupSettings={{
                          prompt: false,
                          plainText: true,
                          keepFormat: false,
                        }}
                        insertImageSettings={{ saveFormat: "Base64" }}
                        ref={editorRef}
                        height={300}
                        placeholder="يرجى إدخال النص هنا..."
                        toolbarSettings={{
                          items: [
                            "Bold",
                            "Italic",
                            "Underline",
                            "Alignments",
                            "OrderedList",
                            "UnorderedList",
                            "Outdent",
                            "Indent",
                            "|",
                            "CreateTable",
                            "CreateLink",
                            "Image",
                            "|",
                            "ClearFormat",
                            "Print",
                            "FullScreen",
                            "|",
                            "Undo",
                            "Redo",
                          ],
                        }}
                      />
                    </Suspense>
                    {/* {stripHtml(String(getValues("advertisementDescription")))
                      .result.length == 0 && (
                      <div className="error">
                        {intl.formatMessage({ id: "CONTENT.EDITOR.REQUIRED" })}
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </>
            {/* )} */}

            {/* Advertisement Start Date and End Date */}
            <div className="row pt-4">
              <div className="col-lg-6">
                <InfoLabels
                  isRequired
                  text={"MOD.SETTING.ADVERTISEMENT.STARTDATE"}
                  customClassName="mb-2 w-100"
                ></InfoLabels>

                <MUIDatePicker
                  {...register("startDate", {
                    required: intl.formatMessage({
                      id: "MOD.ANNOUNCEMENT.STARTDATEREQUIRED",
                    }),
                  })}
                  value={startDate}
                  minDate={new Date()}
                  onDateChange={(date: Date) => handleOnChangeStartDate(date)}
                  placeholder="يوم/ شهر/ سنة"
                  dateFormat="YYYY/MM/DD"
                />
                <div className={"error"}>{errors.startDate?.message}</div>
              </div>

              <div className="col-lg-6">
                <InfoLabels
                  isRequired
                  text={"MOD.SETTING.ADVERTISEMENT.ENDDATE"}
                  customClassName="mb-2 w-100"
                ></InfoLabels>

                <MUIDatePicker
                  {...register("endDate", {
                    required: intl.formatMessage({
                      id: "MOD.ANNOUNCEMENT.ENDDATEREQUIRED",
                    }),
                  })}
                  value={endDate}
                  minDate={startDate ? startDate : new Date()}
                  onDateChange={(date: Date) => handleOnChangeEndDate(date)}
                  placeholder="يوم/ شهر/ سنة"
                  dateFormat="YYYY/MM/DD"
                />
                <div className={"error"}>{errors.endDate?.message}</div>
              </div>
            </div>

            <div className="row pt-4">
              <div className="col-md-6 fv-row fv-plugins-icon-container">
                <InfoLabels
                  style={{}}
                  text={"MOD.SETTING.ADVERTISEMENT.ISBANNERCLICKABLE"}
                  isRequired={false}
                  customClassName="mb-2"
                />
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    role="switch"
                    className="form-check-input"
                    id={`menu-checkbox-1`}
                    {...register("isAdvertisementClickable")}
                    onChange={onChangeIsBannerClickable}
                  />
                </div>
              </div>

              <div className="col-md-6 fv-row fv-plugins-icon-container">
                <InfoLabels
                  style={{}}
                  text={"MOD.SETTING.ADVERTISEMENT.SHOWPOPUPALLTIME"}
                  isRequired={false}
                  customClassName="mb-2"
                />
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    role="switch"
                    className="form-check-input"
                    id={`menu-checkbox-1`}
                    {...register("showPopupAfterDismissed")}
                    onChange={onChangeShowPopupAllTimeClickable}
                  />
                </div>
              </div>
            </div>

            <div className="row pt-4">
              <div
                className="col-md-6 fv-row fv-plugins-icon-container"
                hidden={getValues("isAdvertisementClickable") === false}
              >
                <InfoLabels
                  style={{}}
                  text={"MOD.ANNOUNCEMENT.REDIRECTURL"}
                  isRequired={true}
                  customClassName="mb-2"
                />
                <div hidden={getValues("isAdvertisementClickable") === false}>
                  <input
                    type="text"
                    className="form-control form-control-solid active input5 lbl-txt-medium-2"
                    autoComplete={"off"}
                    placeholder={intl.formatMessage({
                      id: "MOD.MANAGESETTING.APPLICATIONLINKS.APPURL",
                    })}
                    {...register("redirectURL", {
                      // required: intl.formatMessage({
                      //   id: "MOD.MANAGESETTING.APPLICATIONLINKS.APPURLREQ",
                      // }),
                      pattern: {
                        value: urlRegex,
                        message: intl.formatMessage({
                          id: "MOD.NEWS.INVALIDURL",
                        }),
                      },
                      onChange: (e) => handleURLValidation(e),
                    })}
                    name="redirectURL"
                  />

                  <div className={"error"}>{errors.redirectURL?.message}</div>
                </div>
              </div>
              <div className="col-md-6 fv-row fv-plugins-icon-container">
                <div hidden={!(Number(getValues("advertisementType")) === 2)}>
                  {/* {" backgroundImage==> " + getValues("backgroundImage")} */}

                  <div className="mb-3">
                    <InfoLabels
                      style={{}}
                      text={"MOD.SETTING.ADVERTISEMENT.BACKGROUNDIMAGE"}
                      isI18nKey={true}
                      isRequired={false}
                      customClassName="mb-2"
                    />
                    <div className="row">
                      <div className="col-auto fv-row fv-plugins-icon-container">
                        <UserAttachmentUploadButton
                          recordId={0}
                          buttonLayout="DragNDrop-LandingPage"
                          showUpload={true}
                          allowMultipleFileUpload={false}
                          limitToSingleAttachment={true}
                          showUploadTooltip={true}
                          uploadTooltip={""}
                          showFileTypes={true}
                          moduleTypeId={ModulesConstant.ADVERTISEMENT}
                          fileTypes={MIMEConstant_Announcment}
                          perFileMaxAllowedSizeInMb={3}
                          perFileMaxAllowedChunkSizeToSplitInMb={15}
                          onUploadAttachmentChunksComplete={
                            handleOnUploadBGAttachmentChunksComplete
                          }
                          onDisableSubmitAction={handleDisableSubmitAction}
                          storageServer={"mediaserver"}
                          maxLimitForDragNDropUpload={1}
                        />
                      </div>
                      <div className="col-auto pt-3">
                        {String(getValues("backgroundImage")) != "" && (
                          <HtmlTooltip
                            placement="top"
                            title={intl.formatMessage({
                              id: "MOD.SETTING.ADVERTISEMENT.TOOLTIP.REMOVEBG",
                            })}
                            id={generateUUID()}
                          >
                            <FontAwesomeIcon
                              icon={faClose}
                              size="xl"
                              color="var(--icon-color-dark3)"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setValue("backgroundImage", "");
                                toast.success(
                                  intl.formatMessage({
                                    id: "MOD.SETTING.ADVERTISEMENT.SAVE",
                                  })
                                );
                              }}
                            />
                          </HtmlTooltip>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={"error"}>
                    {errors.backgroundImage?.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-8">
          <div className="col-xl-12 d-flex justify-content-end">
            <button
              type="submit"
              id="kt_modal_new_target_submit"
              className="btn MOD_btn btn-create w-10 pl-5 mx-3"
              //   hidden={isReadonly}
            >
              <BtnLabeltxtMedium2 text={"MOD.SETTING.SAVE"} />
            </button>
            <button
              type="button"
              id="kt_modal_new_target_cancel"
              className="btn MOD_btn btn-cancel w-10"
              onClick={() => setShow(false)}
            >
              <BtnLabelCanceltxtMedium2 text={"MOD.SETTING.CANCEL"} />
            </button>
            <button
              type="button"
              onClick={onPreviewClick}
              className="btn MOD_btn btn-cancel w-10 mx-3"
              id={generateUUID()}
            >
              <BtnLabelCanceltxtMedium2 text={"MOD.SETTING.PREVIEW"} />
            </button>
          </div>
        </div>
      </form>

      {/* Announcement Preview */}
      {/* <Modal
        className="announcement-preview"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showPreview}
        onHide={() => setShowPreview(false)}
      >
        <Modal.Body className="p-0"> */}
      {showPreview && (
        <AdvertisementPreview
          advertisementData={previewData as IAdvertisement}
          onClose={() => {
            setShowPreview(false);
          }}
        />
      )}
      {/* </Modal.Body>
      </Modal> */}
    </>
  );
}
