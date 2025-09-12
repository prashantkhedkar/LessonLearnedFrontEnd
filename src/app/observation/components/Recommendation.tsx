import React, { useState, useEffect, useMemo } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { Col, Modal, Row } from "react-bootstrap";
import RecommendationDetails from './RecommendationDetails';
import { generateUUID, writeToBrowserConsole } from '../../modules/utils/common';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, HeaderLabels, InfoLabels } from '../../modules/components/common/formsLabels/detailLabels';
import { useIntl } from 'react-intl';
import DropdownList from '../../modules/components/dropdown/DropdownList';
import { ILookup } from '../../models/global/globalGeneric';
import { GetLookupValues } from '../../modules/services/adminSlice';
import { 
    fetchRecommendationsByObservationId, 
    saveRecommendationForObservation, 
    updateRecommendationForObservation,
    deleteRecommendationForObservation,
    clearError
} from '../../modules/services/recommendationSlice';
import { useAppDispatch, useAppSelector } from '../../../store';
import { unwrapResult } from '@reduxjs/toolkit';
import { useLang } from '../../../_metronic/i18n/Metronici18n';
import DropdownListInModal from '../../modules/components/dropdown/DropdownListInModal';
interface RecommendationProps {
    observationId: string | number;
}

interface RecommendationItem {
    id: number;
    observationId: string | number;
    title: string;
    conclusion: string;
    recommendation: string;
    discussion: string;
    combotFunction: string;
    level: string;
}

const Recommendation: React.FC<RecommendationProps> = ({ observationId }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [conclusion, setConclusion] = useState('');
    const [recommendationText, setRecommendationText] = useState('');
    const [discussion, setDiscussion] = useState('');
    const [combotFunction, setCombotFunction] = useState('');
    const [level, setLevel] = useState('');
    const [combotFunctionOptions, setCombotFunctionOptions] = useState<ILookup[]>([]);
    const [levelOptions, setLevelOptions] = useState<ILookup[]>([]);
    const [editingRecommendation, setEditingRecommendation] = useState<RecommendationItem | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Get state from Redux store
    const { recommendations, loading, error } = useAppSelector((state) => state.recommendations);
    
    // Validation states
    const [errors, setErrors] = useState({
        title: '',
        conclusion: '',
        recommendation: '',
        discussion: '',
        combotFunction: '',
        level: ''
    });
    const [touched, setTouched] = useState({
        title: false,
        conclusion: false,
        recommendation: false,
        discussion: false,
        combotFunction: false,
        level: false
    });

    const intl = useIntl();
    const lang = useLang();
    const dispatch = useAppDispatch();

    // Debug logging
    console.log('Recommendation component rendered with recommendations:', recommendations.length, recommendations);
    console.log('Dropdown options - Combot Function:', combotFunctionOptions.length, 'Level:', levelOptions.length);
    console.log('Current values - combotFunction:', combotFunction, 'level:', level);

    // Fetch recommendations from API when component mounts or observationId changes
    useEffect(() => {
        if (observationId) {
            fetchRecommendationsFromAPI();
        }
    }, [observationId]);

    const fetchRecommendationsFromAPI = async () => {
        if (!observationId) return;

        dispatch(clearError());

        try {
            await dispatch(fetchRecommendationsByObservationId({ 
                observationId 
            })).unwrap();
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            writeToBrowserConsole(`Error fetching recommendations for observation ${observationId}: ${error}`);
        }
    };

    const handleOpen = () => {
        setIsEditMode(false);
        setEditingRecommendation(null);
        setOpen(true);
    };

    const handleEditRecommendation = (recommendationId: number) => {
        console.log('Edit clicked for recommendation ID:', recommendationId);
        const recommendation = recommendations.find(rec => rec.id === recommendationId);
        if (recommendation) {
            console.log('Found recommendation:', recommendation);
            setIsEditMode(true);
            setEditingRecommendation(recommendation);
            setTitle(recommendation.title);
            setConclusion(recommendation.conclusion);
            setRecommendationText(recommendation.recommendation);
            setDiscussion(recommendation.discussion);
            setCombotFunction(recommendation.combotFunction);
            setLevel(recommendation.level);
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false);
        setEditingRecommendation(null);
        setTitle('');
        setConclusion('');
        setRecommendationText('');
        setDiscussion('');
        setCombotFunction('');
        setLevel('');
        setErrors({
            title: '',
            conclusion: '',
            recommendation: '',
            discussion: '',
            combotFunction: '',
            level: ''
        });
        setTouched({
            title: false,
            conclusion: false,
            recommendation: false,
            discussion: false,
            combotFunction: false,
            level: false
        });
    };

    // Validation functions
    const validateField = (fieldName: string, value: string) => {
        let error = '';

        switch (fieldName) {
            case 'title':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.TITLE.REQUIRED' });
                } else if (value.length > 256) {
                    error = intl.formatMessage({ id: 'VALIDATION.TITLE.MAX_LENGTH' });
                }
                break;
            case 'conclusion':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.CONCLUSION.REQUIRED' });
                } else if (value.length > 1000) {
                    error = 'Conclusion must be less than 1000 characters';
                }
                break;
            case 'recommendation':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.RECOMMENDATION.REQUIRED' });
                } else if (value.length > 1000) {
                    error = 'Recommendation must be less than 1000 characters';
                }
                break;
            case 'discussion':
                if (!value.trim()) {
                    error = intl.formatMessage({ id: 'VALIDATION.DISCUSSION.REQUIRED' });
                } else if (value.length > 1000) {
                    error = 'Discussion must be less than 1000 characters';
                }
                break;
            case 'combotFunction':
                if (!value) {
                    error = intl.formatMessage({ id: 'VALIDATION.COMBOT_FUNCTION.REQUIRED' });
                }
                break;
            case 'level':
                if (!value) {
                    error = intl.formatMessage({ id: 'VALIDATION.LEVEL.REQUIRED' });
                }
                break;
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === '';
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        switch (fieldName) {
            case 'title':
                setTitle(value);
                break;
            case 'conclusion':
                setConclusion(value);
                break;
            case 'recommendation':
                setRecommendationText(value);
                break;
            case 'discussion':
                setDiscussion(value);
                break;
            case 'combotFunction':
                setCombotFunction(value);
                break;
            case 'level':
                setLevel(value);
                break;
        }

        if (touched[fieldName as keyof typeof touched]) {
            validateField(fieldName, value);
        }
    };

    const handleFieldBlur = (fieldName: string, value: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName, value);
    };


    const validateAllFields = () => {
        const fields = ['title', 'conclusion', 'recommendation', 'discussion', 'combotFunction', 'level'];
        const values = {
            title,
            conclusion,
            recommendation: recommendationText,
            discussion,
            combotFunction,
            level
        };

        let isValid = true;

        fields.forEach(field => {
            const value = values[field as keyof typeof values];
            if (!validateField(field, value)) {
                isValid = false;
            }
        });

        return isValid;
    };

    useEffect(() => {
        if (open) {
            console.log('Modal opened, loading dropdown options...');
            // Load Combot Function options
            dispatch(GetLookupValues({ lookupType: "Domain" }))
                .then(unwrapResult)
                .then((originalPromiseResult) => {
                    if (originalPromiseResult.statusCode === 200) {
                        const response: ILookup[] = originalPromiseResult.data;
                        console.log('Combot Function options loaded:', response);
                        setCombotFunctionOptions(response);
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    console.error('Error loading combot function options:', rejectedValueOrSerializedError);
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                });

            // Load Level options
            dispatch(GetLookupValues({ lookupType: "Level" }))
                .then(unwrapResult)
                .then((originalPromiseResult) => {
                    if (originalPromiseResult.statusCode === 200) {
                        const response: ILookup[] = originalPromiseResult.data;
                        console.log('Level options loaded:', response);
                        setLevelOptions(response);
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    console.error('Error loading level options:', rejectedValueOrSerializedError);
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                });
        }
    }, [dispatch, open]);

    const handleAddRecommendation = async () => {
        // Mark all fields as touched
        setTouched({
            title: true,
            conclusion: true,
            recommendation: true,
            discussion: true,
            combotFunction: true,
            level: true
        });

        // Validate all fields
        if (validateAllFields()) {
            dispatch(clearError());
            
            try {
                if (isEditMode && editingRecommendation) {
                    // Update existing recommendation
                    await dispatch(updateRecommendationForObservation({
                        recommendationId: editingRecommendation.id,
                        recommendationData: {
                            title,
                            conclusion,
                            recommendation: recommendationText,
                            discussion,
                            combotFunction,
                            level,
                        }
                    })).unwrap();
                } else {
                    // Add new recommendation
                    await dispatch(saveRecommendationForObservation({
                        observationId,
                        recommendationData: {
                            title,
                            conclusion,
                            recommendation: recommendationText,
                            discussion,
                            combotFunction,
                            level,
                        }
                    })).unwrap();
                }
                
                handleClose();
            } catch (error) {
                console.error('Error saving recommendation:', error);
                writeToBrowserConsole(`Error saving recommendation for observation ${observationId}: ${error}`);
            }
        }
    };

    const handleDeleteRecommendation = async (recommendationId: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه التوصية؟')) {
            return;
        }

        dispatch(clearError());
        
        try {
            await dispatch(deleteRecommendationForObservation({
                recommendationId
            })).unwrap();
        } catch (error) {
            console.error('Error deleting recommendation:', error);
            writeToBrowserConsole(`Error deleting recommendation ${recommendationId}: ${error}`);
        }
    };

    return (
        <>
            {console.log('Current recommendations array:', recommendations)}
            <div className="">
                <div className="row g-0">
                    <div className="col-md-11">
                    </div>
                    <div className="col-md-1 d-flex justify-content-end align-items-center">
                        
                        <button
                    id="kt_modal_new_target_create_new"
                    className="btn MOD_btn btn-create w-10 pl-5"
                    onClick={handleOpen}
                  >
                    <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
                    <BtnLabeltxtMedium2
                      text={"BUTTON.LABEL.NEWSERVICE"}
                      isI18nKey={true}
                    />{" "}
                  </button>
                    </div>
                </div>
            </div>

            <Box sx={{ mt: 2 }}>
                 

  <DropdownList
                                    dataKey="lookupId"
                                    dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                                    defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.LEVEL" })}
                                    value={combotFunction}
                                    data={levelOptions}
                                   // setSelectedValue={(value) => formik.setFieldValue('level', value)}
                                />
                <Modal
                     
                   backdrop="static"
                   keyboard={false}
                    centered
                    size="lg"
                    animation={false}
                   enforceFocus={false}
                   restoreFocus={false}
                    dialogClassName="modal-dialog-scrollable"
                    aria-labelledby="contained-modal-title-vcenter"
                    show={open}
                    onHide={handleClose}
                 
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <HeaderLabels
                                text={
                                    isEditMode ? "تعديل التوصية" : " إضافة توصية جديدة"
                                }
                            />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body  >
                        {/* Title Field */}
                        <div className="col-12 mb-4">
                            <div className="row align-items-center">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.TITLE" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <input
                                        type="text"
                                        autoComplete='off'
                                        className="form-control form-control-solid active input5 lbl-txt-medium-2"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.TITLE" })}
                                        value={title}
                                        onChange={(e) => handleFieldChange('title', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('title', e.target.value)}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.title && errors.title && (
                                        <div className="invalid-feedback d-block">{errors.title}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Combot Function and Level Dropdowns */}
                        <div className="col-12 mb-4">
                            <div className="row align-items-center">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.COMBOT_FUNCTION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <DropdownListInModal
                                        className="w-100"
                                        dataKey="lookupId"
                                        dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                                        defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.COMBOT_FUNCTION" })}
                                        value={combotFunction}
                                        data={combotFunctionOptions || []}
                                        setSelectedValue={(value) => {
                                            console.log('Combot Function selected:', value);
                                            handleFieldChange('combotFunction', value);
                                            handleFieldBlur('combotFunction', value);
                                        }}
                                        isClearable={true}
                                    />

                                   
                                    {touched.combotFunction && errors.combotFunction && (
                                        <div className="invalid-feedback d-block">{errors.combotFunction}</div>
                                    )}
                                </div>
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.LEVEL" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <DropdownListInModal
                                        className="w-100"
                                        dataKey="lookupId"
                                        dataValue={lang === "ar" ? "lookupNameAr" : "lookupName"}
                                        defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.LEVEL" })}
                                        value={level}
                                        data={levelOptions || []}
                                        setSelectedValue={(value) => {
                                            console.log('Level selected:', value);
                                            handleFieldChange('level', value);
                                            handleFieldBlur('level', value);
                                        }}
                                        isClearable={true}
                                    />
                                    {touched.level && errors.level && (
                                        <div className="invalid-feedback d-block">{errors.level}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Conclusion Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.CONCLUSION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        className="form-control"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.CONCLUSION" })}
                                        value={conclusion}
                                        onChange={(e) => handleFieldChange('conclusion', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('conclusion', e.target.value)}
                                        rows={3}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.conclusion && errors.conclusion && (
                                        <div className="invalid-feedback d-block">{errors.conclusion}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.RECOMMENDATION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        className="form-control"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.RECOMMENDATION" })}
                                        value={recommendationText}
                                        onChange={(e) => handleFieldChange('recommendation', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('recommendation', e.target.value)}
                                        rows={3}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.recommendation && errors.recommendation && (
                                        <div className="invalid-feedback d-block">{errors.recommendation}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Discussion Field */}
                        <div className="col-12 mb-4">
                            <div className="row">
                                <div className="col-md-2">
                                    <InfoLabels
                                        style={{}}
                                        text={intl.formatMessage({ id: "LABEL.DISCUSSION" })}
                                        isRequired={true}
                                    />
                                </div>
                                <div className="col-md-10">
                                    <textarea
                                        className="form-control"
                                        placeholder={intl.formatMessage({ id: "PLACEHOLDER.DISCUSSION" })}
                                        value={discussion}
                                        onChange={(e) => handleFieldChange('discussion', e.target.value)}
                                        onBlur={(e) => handleFieldBlur('discussion', e.target.value)}
                                        rows={3}
                                        dir={lang === "ar" ? "rtl" : "ltr"}
                                    />
                                    {touched.discussion && errors.discussion && (
                                        <div className="invalid-feedback d-block">{errors.discussion}</div>
                                    )}
                                </div>
                            </div>
                        </div>


                    </Modal.Body> 
                     <Modal.Footer className="py-5 pt-4">
                        <button
                            type="button"
                            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                            onClick={handleAddRecommendation}
                            disabled={loading}
                        >
                            <BtnLabeltxtMedium2
                                text={isEditMode ? "BUTTON.LABEL.UPDATE" : "BUTTON.LABEL.SUBMIT"}
                            />
                            {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary mx-3"
                            onClick={handleClose}
                        >
                            <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
                        </button>
                    </Modal.Footer>
                </Modal>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" mb={1}>التوصيات:</Typography>
                    
                    {error && (
                        <Typography variant="body2" color="error" mb={2}>
                            {error}
                        </Typography>
                    )}
                    
                    {loading && (
                        <Box display="flex" justifyContent="center" my={2}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </Box>
                    )}
                    
                    {!loading && recommendations.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">لا توجد توصيات بعد.</Typography>
                    ) : (
                        recommendations.map((rec, index) => {
                            console.log('Rendering RecommendationDetails for rec:', rec.id, 'with handleEditRecommendation function:', typeof handleEditRecommendation);
                            return (
                                <RecommendationDetails
                                    key={rec.id}
                                    text={`${rec.title}: ${rec.recommendation}`}
                                    timestamp={new Date()}
                                    status="read"
                                    direction="rtl"
                                    observationId={rec.observationId}
                                    index={index + 1}
                                    recommendationId={rec.id}
                                    onEditClick={() => {
                                        console.log('onEditClick called for rec.id:', rec.id);
                                        handleEditRecommendation(rec.id);
                                    }}
                                    onDeleteClick={() => {
                                        console.log('onDeleteClick called for rec.id:', rec.id);
                                        handleDeleteRecommendation(rec.id);
                                    }}
                                />
                            );
                        })
                    )}
                </Box>
            </Box>
        </>
    );
};

export default Recommendation;
