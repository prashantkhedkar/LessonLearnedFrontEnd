import { useMemo, useState, useEffect } from "react";
import { FormModel, IFormProps } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import { MUIDatePicker } from "../../datePicker/MUIDatePicker";
import DropdownListInModal from "../../dropdown/DropdownListInModal";
import { accommodationService } from "../../../../services/accommodationService";
import { AccommodationSearchModel } from "../../../../models/accommodation/accommodationModels";
import { Col, Row } from "react-bootstrap";
import { GlobalLabel } from "../../common/label/LabelCategory";

export const SELECTROOMS = <T extends FormModel>({
  divClass,
  containerClass,
  headerClass,
  inputClass,
  formControl,
  formHook,
  customHandlers,
  readonly,
  isDisabled,
}: IFormProps<T> & { readonly?: boolean }) => {
  const intl = useIntl();
  const [validatorSchema, setValidatorSchema] = useState<object>({});
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Extract field keys for the three components
  const roomFieldKey = `${formControl.fieldKey}_room` as FieldPath<T>;
  const startDateFieldKey = `${formControl.fieldKey}_startDate` as FieldPath<T>;
  const endDateFieldKey = `${formControl.fieldKey}_endDate` as FieldPath<T>;

  const errors = formHook.formState.errors;

  // Fetch room options from API when component loads
  useEffect(() => {
    const fetchRoomOptions = async () => {
      try {
        setLoadingRooms(true);

        // Prepare search parameters to get all available rooms
        const searchParams: AccommodationSearchModel = {
          pageNumber: 1,
          pageSize: 100, // Get first 100 rooms
          sortBy: "roomName",
          sortDirection: "asc",
          availabilityStatus: 1, // Only available rooms
        };

        const response = await accommodationService.getAvailableRooms();

        if (response.success && response.data) {
          // Transform accommodation data to dropdown format
          const transformedOptions = response.data.map((accommodation) => ({
            value: accommodation.accommodationId.toString(),
            label: accommodation.roomName,
            fieldId: accommodation.accommodationId,
            // Include additional info that might be useful
            accommodationType: accommodation.accommodationType,
            location: accommodation.location,
            capacity: accommodation.roomCapacity,
          }));

          setRoomOptions(transformedOptions);
        } else {
          // Fallback to default options if API fails
          setRoomOptions([]);
        }
      } catch (error) {
        // Fallback to default options if API fails
        setRoomOptions([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRoomOptions();
  }, []); // Empty dependency array means this runs once on component mount

  // Set up validation rules
  useMemo(() => {
    let schema = {};

    if (formControl.isRequired) {
      schema = {
        ...schema,
        required: intl.formatMessage({ id: "LABEL.REQUIRED" }),
      };
    }

    setValidatorSchema(schema);
  }, [formControl.isRequired, intl]);

  // Get today's date for minimum date validation
  const today = new Date();

  // Helper function to convert Date to string if needed
  const convertToDate = (value: any): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    return undefined;
  };

  return (
    <>
      {/* Room Selection Dropdown */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="row">
            <div className="col-md-4">
              {" "}
              <InfoLabels
                isRequired
                text={intl.formatMessage({
                  id: "SELECTROOMS.SELECTROOM",
                })}
              />
            </div>
            <div className="col-md-8">
              {" "}
              <Controller
                name={roomFieldKey}
                control={formHook.control}
                rules={validatorSchema}
                render={({ field }) => (
                  <DropdownListInModal
                    dataKey="value"
                    dataValue="label"
                    data={roomOptions}
                    value={field.value || ""}
                    setSelectedValue={(value) => {
                      field.onChange(value);
                      if (customHandlers?.onChangeDropDownList) {
                        customHandlers.onChangeDropDownList(
                          [value],
                          formControl
                        );
                      }
                    }}
                    defaultText={
                      loadingRooms
                        ? intl.formatMessage(
                            { id: "SELECTROOMS.LOADING_ROOMS" },
                            { defaultMessage: "Loading rooms..." }
                          )
                        : intl.formatMessage(
                            { id: "SELECTROOMS.ROOM_PLACEHOLDER" },
                            { defaultMessage: "Choose a room..." }
                          )
                    }
                    isDisabled={readonly || isDisabled || loadingRooms}
                    isReadOnly={readonly || isDisabled || loadingRooms}
                    key={`room-${formControl.fieldKey}`}
                    id={`room-${formControl.fieldKey}`}
                  />
                )}
              />
              {errors[roomFieldKey] && (
                <ErrorLabel text={errors[roomFieldKey]?.message as string} />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="row">
            <div className="col-md-4">
              {" "}
              <InfoLabels
                isRequired
                text={intl.formatMessage({
                  id: "SELECTROOMS.START_DATE",
                })}
              />
            </div>
            <div
              className={
                readonly || isDisabled || loadingRooms
                  ? "col-md-8 disabled-warpper"
                  : "col-md-8"
              }
            >
              {" "}
              <Controller
                name={startDateFieldKey}
                control={formHook.control}
                rules={validatorSchema}
                render={({ field }) => (
                  <MUIDatePicker
                    isDisabled={readonly || isDisabled || loadingRooms}
                    isReadOnly={readonly || isDisabled || loadingRooms}
                    id={`start-date-${formControl.fieldKey}`}
                    key={`start-date-${formControl.fieldKey}`}
                    value={convertToDate(field.value)}
                    onDateChange={(date) => {
                      field.onChange(date);
                      // Clear end date if it's before the new start date
                      const endDate = formHook.getValues(endDateFieldKey);
                      const startDate = convertToDate(date);
                      const endDateValue = convertToDate(endDate);

                      if (
                        endDateValue &&
                        startDate &&
                        startDate > endDateValue
                      ) {
                        formHook.setValue(endDateFieldKey, null as any);
                      }

                      if (customHandlers?.onChangeDate) {
                        customHandlers.onChangeDate(date, formControl);
                      }
                    }}
                    minDate={today}
                    maxDate={convertToDate(formHook.watch(endDateFieldKey))}
                    placeholder={intl.formatMessage(
                      { id: "SELECTROOMS.START_DATE_PLACEHOLDER" },
                      { defaultMessage: "Select start date" }
                    )}
                  />
                )}
              />
              {errors[startDateFieldKey] && (
                <ErrorLabel
                  text={errors[startDateFieldKey]?.message as string}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="row">
            <div className="col-md-4">
              {" "}
              <InfoLabels
                isRequired
                text={intl.formatMessage({
                  id: "SELECTROOMS.END_DATE",
                })}
              />
            </div>
            <div
              className={
                readonly || isDisabled || loadingRooms
                  ? "col-md-8 disabled-warpper"
                  : "col-md-8"
              }
            >
              {" "}
              <Controller
                name={endDateFieldKey}
                control={formHook.control}
                rules={validatorSchema}
                render={({ field }) => (
                  <MUIDatePicker
                    id={`end-date-${formControl.fieldKey}`}
                    key={`end-date-${formControl.fieldKey}`}
                    value={convertToDate(field.value)}
                    onDateChange={(date) => {
                      field.onChange(date);
                      if (customHandlers?.onChangeDate) {
                        customHandlers.onChangeDate(date, formControl);
                      }
                    }}
                    minDate={
                      convertToDate(formHook.watch(startDateFieldKey)) || today
                    }
                    isDisabled={readonly || isDisabled}
                    placeholder={intl.formatMessage(
                      { id: "SELECTROOMS.END_DATE_PLACEHOLDER" },
                      { defaultMessage: "Select end date" }
                    )}
                  />
                )}
              />
              {errors[endDateFieldKey] && (
                <ErrorLabel text={errors[endDateFieldKey]?.message as string} />
              )}
            </div>
          </div>
        </div>{" "}
      </div>
    </>
  );
};

export default SELECTROOMS;
