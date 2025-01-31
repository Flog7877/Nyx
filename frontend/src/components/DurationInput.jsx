import React, { useRef, useEffect } from 'react';

function DurationInput({ initialValue, onSubmit, disabled }) {
    const hrsRef = useRef(null);
    const minsRef = useRef(null);
    const secsRef = useRef(null);

    // Effekt: Aktualisiere Felder bei Änderungen von initialValue, wenn sie nicht fokussiert sind
    useEffect(() => {
        if (initialValue) {
            const parts = initialValue.split(":");
            if (hrsRef.current && document.activeElement !== hrsRef.current) {
                hrsRef.current.value = parts[0] || "00";
            }
            if (minsRef.current && document.activeElement !== minsRef.current) {
                minsRef.current.value = parts[1] || "00";
            }
            if (secsRef.current && document.activeElement !== secsRef.current) {
                secsRef.current.value = parts[2] || "00";
            }
        }
    }, [initialValue]);

    const handleSetClick = (e) => {
        e.preventDefault();
        const hrsVal = hrsRef.current.value.replace(/\D/g, "").padStart(2, "0");
        const minsVal = minsRef.current.value.replace(/\D/g, "").padStart(2, "0");
        const secsVal = secsRef.current.value.replace(/\D/g, "").padStart(2, "0");

        let hrsNum = parseInt(hrsVal, 10);
        let minsNum = parseInt(minsVal, 10);
        let secsNum = parseInt(secsVal, 10);

        // Normalisiere Sekunden und Minuten
        if (secsNum >= 60) {
            minsNum += Math.floor(secsNum / 60);
            secsNum = secsNum % 60;
        }
        if (minsNum >= 60) {
            hrsNum += Math.floor(minsNum / 60);
            minsNum = minsNum % 60;
        }

        const formatted = `${String(hrsNum).padStart(2, "0")}:${String(minsNum).padStart(2, "0")}:${String(secsNum).padStart(2, "0")}`;
        onSubmit(formatted);
    };

    const handleKeyUp = (e, nextRef) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length === 2 && nextRef?.current) {
            nextRef.current.focus();
            nextRef.current.select();
        }
    };

    // Bei Bedarf können wir onChange-Handler behalten, um Eingaben zu bereinigen,
    // aber sie verändern nur den Wert des jeweiligen Input-Feldes über die Refs.
    const handleHrsChange = (e) => {
        let newVal = e.target.value;
        hrsRef.current.value = newVal.replace(/\D/g, "").slice(0, 2);
    };

    const handleMinsChange = (e) => {
        let newVal = e.target.value;
        minsRef.current.value = newVal.replace(/\D/g, "").slice(0, 2);
    };

    const handleSecsChange = (e) => {
        let newVal = e.target.value;
        secsRef.current.value = newVal.replace(/\D/g, "").slice(0, 2);
    };

    return (
            <form onSubmit={handleSetClick} style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                <div>
                    <input
                        type="text"
                        defaultValue="00"
                        ref={hrsRef}
                        disabled={disabled}
                        maxLength="2"
                        style={{ width: "2em", textAlign: "center" }}
                        onKeyUp={(e) => handleKeyUp(e, minsRef)}
                        onChange={handleHrsChange}
                    />
                    :
                    <input
                        type="text"
                        defaultValue="00"
                        ref={minsRef}
                        disabled={disabled}
                        maxLength="2"
                        style={{ width: "2em", textAlign: "center" }}
                        onKeyUp={(e) => handleKeyUp(e, secsRef)}
                        onChange={handleMinsChange}
                    />
                    :
                    <input
                        type="text"
                        defaultValue="00"
                        ref={secsRef}
                        disabled={disabled}
                        maxLength="2"
                        style={{ width: "2em", textAlign: "center" }}
                        onChange={handleSecsChange}
                    />
                </div>
                <div>
                    <button type="submit" disabled={disabled} style={{ marginLeft: '10px', padding: '4px' }}>Set</button>
                </div>
            </form>
    );
}

export default DurationInput;
