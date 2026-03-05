const buttons = document.querySelectorAll(".button");
const overlay = document.getElementById("formOverlay");
const form = document.getElementById("reservationForm");
const formTitle = document.getElementById("formTitle");
const closeBtn = document.querySelector(".closeBtn");


let reservations = [];


closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
});


buttons.forEach(button => {
    button.addEventListener("click", () => {
        const sport = button.getAttribute("data-sport");
        formTitle.textContent = `Rezervace: ${sport}`;
        overlay.style.display = "flex";
        form.dataset.sport = sport;
    });
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const sport = form.dataset.sport;
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    reservations.push({sport, name, date, time});
    alert(`Rezervace pro ${sport} byla úspěšná!`);

    form.reset();
    overlay.style.display = "none";
    console.log("Aktuální rezervace:", reservations);
});
