import { useMemo, useRef, useState } from "react";
import type { IJodit } from 'jodit/types'
import JoditEditor from 'jodit-react'

export const JoditEditorComponent = ({ onSearchChangeHandler, isReadOnly }: {
    onSearchChangeHandler: any;
    isReadOnly?: boolean;
    cssClass?: string;
}
) => {

    const [disableControls, setDisableControls] = useState<boolean>(false);
    const editorRef = useRef<IJodit>(null);

    const DEFAULT_JODIT_CONFIG = {
        autoFocus: false,
        placeholder: "",
        language: "ar",
        debugLanguage: true,
        i18n: { ar: { 'Insert as Text': 'التنسيق الإفتراضي', 'Keep': 'احتفظ بالتنسيق', 'Clean': 'التنسيق الإفتراضي', 'Insert only Text': 'إدراج النص فقط', } },
        allowTab: true,
        tabIndex: 1,
        tabWidth: 3,
        editorClassName: "custom-jodit-editor",
        buttons: [
            "bold", "underline", "|",
            "ul", "ol", "|",
            "table", "|",
            "align", "eraser", "undo"
        ],
        events: {
            openPasteDialog: (popup) => {
                const interval = setInterval(() => {
                    const pasteButton = popup.querySelector('.jodit-ui-button__text')
                    if (pasteButton) {
                        pasteButton.textContent = "hi"
                        clearInterval(interval)
                    }
                }, 100)
            },
        },
        paste: {
            clean: true
        },
        toolbarAdaptive: false
    }

    const config = useMemo(() => ({
        ...DEFAULT_JODIT_CONFIG,
        readOnly: disableControls
    }), [disableControls]);

    return (
        <>

            <JoditEditor
                config={config}
                onChange={(list: any) => {
                    onSearchChangeHandler(list);
                }}
                ref={editorRef}
            />
        </>
    )
}