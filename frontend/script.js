/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = "http://127.0.0.1:8000";


/* =========================================================
   NAVIGATION
========================================================= */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");


const pageTitles = {

    dashboard: "Customer Churn Overview",

    predict: "Predict Customer Churn",

    analytics: "Model Performance",

    about: "About ChurnIQ"

};


function navigateTo(pageName) {

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageName
        );

    });


    pageTitle.textContent = pageTitles[pageName];

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


navItems.forEach(item => {

    item.addEventListener("click", () => {

        navigateTo(item.dataset.page);

    });

});


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");


mobileMenu.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});


/* =========================================================
   API STATUS
========================================================= */

async function checkAPI() {

    const status =
        document.getElementById("apiStatus");

    const indicator =
        document.querySelector(".api-indicator");


    try {

        const response =
            await fetch(API_URL + "/");


        if (!response.ok)
            throw new Error();


        status.textContent = "Connected";

        indicator.style.background =
            "#62c6a5";

        indicator.style.boxShadow =
            "0 0 10px rgba(98,198,165,.5)";

    }

    catch (error) {

        status.textContent = "Offline";

        indicator.style.background =
            "#e57474";

        indicator.style.boxShadow =
            "0 0 10px rgba(229,116,116,.4)";

    }

}


checkAPI();


/* =========================================================
   FORM ELEMENT HELPER
========================================================= */

function value(id) {

    return document.getElementById(id).value;

}


/* =========================================================
   PREDICTION
========================================================= */

const predictionForm =
    document.getElementById("predictionForm");


predictionForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const button =
            document.getElementById("predictBtn");


        const originalHTML =
            button.innerHTML;


        button.disabled = true;


        button.innerHTML = `
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            Analyzing...
        `;


        const customerData = {

            gender: value("gender"),

            SeniorCitizen:
                Number(value("SeniorCitizen")),

            Partner:
                value("Partner"),

            Dependents:
                value("Dependents"),

            tenure:
                Number(value("tenure")),

            PhoneService:
                value("PhoneService"),

            MultipleLines:
                value("MultipleLines"),

            InternetService:
                value("InternetService"),

            OnlineSecurity:
                value("OnlineSecurity"),

            OnlineBackup:
                value("OnlineBackup"),

            DeviceProtection:
                value("DeviceProtection"),

            TechSupport:
                value("TechSupport"),

            StreamingTV:
                value("StreamingTV"),

            StreamingMovies:
                value("StreamingMovies"),

            Contract:
                value("Contract"),

            PaperlessBilling:
                value("PaperlessBilling"),

            PaymentMethod:
                value("PaymentMethod"),

            MonthlyCharges:
                Number(value("MonthlyCharges")),

            TotalCharges:
                Number(value("TotalCharges"))

        };


        try {

            const response =
                await fetch(
                    API_URL + "/predict",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(customerData)

                    }
                );


            if (!response.ok) {

                const errorData =
                    await response.json();

                throw new Error(
                    errorData.detail ||
                    "Prediction failed"
                );

            }


            const result =
                await response.json();


            showPrediction(result);

            savePrediction(
                customerData,
                result
            );


            showToast(
                "Prediction completed successfully."
            );


        }

        catch (error) {

            console.error(error);

            showToast(
                "Unable to connect to the prediction API.",
                true
            );

        }


        finally {

            button.disabled = false;

            button.innerHTML =
                originalHTML;

        }

    }
);


/* =========================================================
   SHOW RESULT
========================================================= */

function showPrediction(result) {

    const panel =
        document.getElementById("resultPanel");


    const probability =
        Number(result.churn_probability);


    const percentage =
        probability * 100;


    const prediction =
        result.churn_prediction;


    const probabilityText =
        document.getElementById(
            "probabilityValue"
        );


    const predictionText =
        document.getElementById(
            "predictionText"
        );


    const description =
        document.getElementById(
            "riskDescription"
        );


    const badge =
        document.getElementById(
            "riskBadge"
        );


    const ring =
        document.getElementById(
            "riskRing"
        );


    probabilityText.textContent =
        percentage.toFixed(1) + "%";


    ring.style.background = `
        conic-gradient(
            ${getRiskColor(probability)}
            ${percentage * 3.6}deg,
            #262832
            ${percentage * 3.6}deg
        )
    `;


    if (prediction === "Yes") {

        badge.textContent =
            getRiskLevel(probability);


        predictionText.textContent =
            "Customer is at risk of churn";


        description.textContent =
            `The model estimates a ${percentage.toFixed(1)}% `
            + `probability that this customer will churn. `
            + `Consider reviewing this customer's engagement, `
            + `contract and service experience.`;

    }

    else {

        badge.textContent =
            "LOWER CHURN RISK";


        predictionText.textContent =
            "Customer is less likely to churn";


        description.textContent =
            `The model estimates a ${percentage.toFixed(1)}% `
            + `probability of churn, which is below the `
            + `0.33 decision threshold.`;

    }


    badge.style.background =
        `${getRiskColor(probability)}18`;


    badge.style.color =
        getRiskColor(probability);


    panel.classList.add("show");


    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   RISK LEVEL
========================================================= */

function getRiskLevel(probability) {

    if (probability >= 0.70)
        return "HIGH CHURN RISK";

    if (probability >= 0.50)
        return "ELEVATED CHURN RISK";

    return "MODERATE CHURN RISK";

}


function getRiskColor(probability) {

    if (probability >= 0.70)
        return "#e57474";

    if (probability >= 0.33)
        return "#d5b76d";

    return "#62c6a5";

}


/* =========================================================
   CLOSE RESULT
========================================================= */

function closeResult() {

    document
        .getElementById("resultPanel")
        .classList.remove("show");

}


/* =========================================================
   LOCAL PREDICTION HISTORY
========================================================= */

function savePrediction(customer, result) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "churnHistory"
            ) || "[]"
        );


    history.unshift({

        timestamp:
            new Date().toLocaleString(),

        tenure:
            customer.tenure,

        contract:
            customer.Contract,

        monthlyCharges:
            customer.MonthlyCharges,

        probability:
            result.churn_probability,

        prediction:
            result.churn_prediction

    });


    if (history.length > 10) {

        history.pop();

    }


    localStorage.setItem(
        "churnHistory",
        JSON.stringify(history)
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, error = false) {

    const toast =
        document.getElementById("toast");


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector("i");


    if (error) {

        icon.className =
            "fa-solid fa-circle-exclamation";

        icon.style.color =
            "#e57474";

    }

    else {

        icon.className =
            "fa-solid fa-circle-check";

        icon.style.color =
            "#62c6a5";

    }


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}


/* =========================================================
   AUTO CALCULATE TOTAL CHARGES
========================================================= */

const tenureInput =
    document.getElementById("tenure");

const monthlyInput =
    document.getElementById(
        "MonthlyCharges"
    );

const totalInput =
    document.getElementById(
        "TotalCharges"
    );


function suggestTotalCharges() {

    const tenure =
        Number(tenureInput.value);

    const monthly =
        Number(monthlyInput.value);


    if (
        tenure > 0 &&
        monthly > 0 &&
        totalInput.dataset.edited !== "true"
    ) {

        totalInput.value =
            (tenure * monthly).toFixed(2);

    }

}


tenureInput.addEventListener(
    "input",
    suggestTotalCharges
);


monthlyInput.addEventListener(
    "input",
    suggestTotalCharges
);


totalInput.addEventListener(
    "input",
    () => {

        totalInput.dataset.edited =
            "true";

    }
);


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "enter"
        ) {

            predictionForm.requestSubmit();

        }

    }
);