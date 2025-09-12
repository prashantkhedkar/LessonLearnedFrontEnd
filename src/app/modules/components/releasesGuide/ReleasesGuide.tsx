import { useEffect, useState } from "react";
import { JPBadgeButton } from "../../utils/util";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";
import { Col, Container, Modal, Row } from "react-bootstrap";
import css from "./ReleasesGuide.module.css";
import './ReleasesGuide.css';
import RenderFontAwesome from "../../utils/RenderFontAwesome";
import { ReleaseNote } from "./models";

// HideModal: if it is true, the modal will not be displayed no mater what
// HideButton: if it is true, the trigger button that open the modal on click will not be displayed
// displayButtonComponent: in case this parameter if passed, the passed component will replace the default button
function ReleasesGuide(props: { HideModal?: boolean, HideButton?: boolean, displayButtonComponent?: React.FC<any>, lang?: "en" | "ar" }) {

    const [releasesNote, setReleasesNote] = useState<ReleaseNote>();
    const [isOpen, setIsOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [lang, setLang] = useState<"en" | "ar">(props.lang ? props.lang : "ar");


    function handleCookie(newRelease: string) {
        const splittedCookie = String(document.cookie).split(";");
        for (const cookie in splittedCookie) {
            const [key, value] = splittedCookie[cookie].split("=");
            if (key == "release" && value == newRelease) {
                return;
            }
        }
        setIsOpen(true);
        const expiryDate = (new Date(new Date().setFullYear(new Date().getFullYear() + 2))).toUTCString();
        document.cookie = "release=" + newRelease + ";expires=" + expiryDate + ";path=/";
    }

    ////////////////////////// EXTERNAL JSON CONFIG FILE //////////////////////////////
    useEffect(() => {



        try {
            fetch(toAbsoluteUrl('/media/ReleaseNote.json'))
                .then((r) => r.json())
                .then((ReleaseNoteJson) => {
                    setReleasesNote(ReleaseNoteJson);
                    handleCookie(ReleaseNoteJson.ReleaseEN);
                });
        }
        catch (e) {
            setIsError(true);
        }

    }, []);

    function closeModal() {
        setIsOpen(false);
    }

    return (
        <>
            {
                <>{
                    !props.HideButton && <div style={{ cursor: "pointer" }}
                        onClick={() => setIsOpen(true)}
                    >
                        {
                            props.displayButtonComponent
                                ?
                                <props.displayButtonComponent />
                                :
                                <JPBadgeButton linktext={""} customClassName={`notification_bell_box`} tooltiptext={lang == "ar" ? "دليل الاصدار" : "Release Note"} isDisabled={false} onClick={() => { }}>
                                    <svg width="24" height="24" viewBox="12 11 20 20" fill="none" >
                                        <path d="M22 12.85C17.4989 12.85 13.85 16.4989 13.85 21C13.85 25.5011 17.4989 29.15 22 29.15C26.5011 29.15 30.15 25.5011 30.15 21C30.15 16.4989 26.5011 12.85 22 12.85ZM12.15 21C12.15 15.56 16.56 11.15 22 11.15C27.44 11.15 31.85 15.56 31.85 21C31.85 26.44 27.44 30.85 22 30.85C16.56 30.85 12.15 26.44 12.15 21ZM23 25C23 25.5523 22.5523 26 22 26C21.4477 26 21 25.5523 21 25C21 24.4477 21.4477 24 22 24C22.5523 24 23 24.4477 23 25ZM20.85 19C20.85 18.3649 21.3649 17.85 22 17.85C22.6352 17.85 23.15 18.3649 23.15 19V19.1213C23.15 19.4585 23.0161 19.7819 22.7777 20.0203L21.399 21.399C21.067 21.7309 21.067 22.2691 21.399 22.6011C21.7309 22.933 22.2691 22.933 22.6011 22.6011L23.9797 21.2224C24.537 20.6652 24.85 19.9094 24.85 19.1213V19C24.85 17.426 23.574 16.15 22 16.15C20.426 16.15 19.15 17.426 19.15 19V19.5C19.15 19.9695 19.5306 20.35 20 20.35C20.4695 20.35 20.85 19.9695 20.85 19.5V19Z" fill="#9CA3AF" />
                                    </svg>
                                </JPBadgeButton>
                        }
                    </div>
                }
                    {
                        !props.HideModal && <Modal id="releaseNote"
                            show={isOpen}
                            keyboard={false} backdrop="static"
                            dialogClassName={css.dialogClassMulti}
                            contentClassName={css.modalContentClass}
                        >

                            <Container className={css.containerModalHeader}>
                                <Row>
                                    <Col className={css.titleCol}>
                                        <div className={css.titleText}>
                                            {lang == "ar" ? "دليل الاصدار" : "Release Note"}
                                        </div>

                                    </Col>
                                    <Col>
                                        <div
                                            onClick={closeModal}
                                            className={css.modalCloseButton + " float-end"}
                                        >
                                            <RenderFontAwesome display icon="reject" size="1x" color="#9ca3af" />
                                        </div>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col style={{ "marginTop": "1rem" }}>
                                        <div className={css.theLine} />
                                    </Col>

                                </Row>

                            </Container>



                            <Modal.Body style={{ padding: "0" }}>
                                {releasesNote &&
                                    <Container className={css.containerFrame}>
                                        <Row>
                                            <Col className={css.releaseAndDate}>
                                                {(lang == "en" ? releasesNote.ReleaseEN : releasesNote.ReleaseAR) + " - " + releasesNote.Date}
                                            </Col>
                                        </Row>
                                        <Row>


                                            <Col>
                                                {
                                                    releasesNote.Groups.map((group, index) =>
                                                        <>
                                                            {group.Items.length > 0 &&
                                                                <>
                                                                    <div className={css.groupName}>
                                                                        {
                                                                            lang == "en" ? group.GroupEN : group.GroupAR
                                                                        }
                                                                    </div>

                                                                    <div id="releaseNoteUl" className={css.items}>
                                                                        {
                                                                            group && group.Items.map(item =>
                                                                                <li>
                                                                                    {
                                                                                        lang == "en" ? item.ItemEN : item.ItemAR
                                                                                    }
                                                                                </li>
                                                                            )
                                                                        }
                                                                    </div>

                                                                    {
                                                                        index < releasesNote.Groups.length - 1 && <Row>
                                                                            <Col style={{ "marginBottom": "1.25rem" }}>
                                                                                <div className={css.theLine} />
                                                                            </Col>
                                                                        </Row>
                                                                    }
                                                                </>
                                                            }
                                                        </>
                                                    )
                                                }
                                            </Col>
                                        </Row>
                                    </Container>
                                }
                            </Modal.Body>


                            <Container className={css.containerModalFooter}>
                                <Col>
                                    <div
                                        onClick={closeModal}
                                        className={css.modalCloseButton + " float-end"}
                                    >

                                        <div className={css.closeButtonText}>
                                            {lang == "en" ? "Close" : "اغلاق"}

                                        </div>
                                    </div>
                                </Col>

                            </Container>
                            <div style={{ marginBottom: "1rem" }} />
                        </Modal>
                    }
                </>
            }
        </>

    );
}

export default ReleasesGuide;