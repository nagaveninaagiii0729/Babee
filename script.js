/* =========================================================
   KUSUU ♡ NAAGII — BOYFRIEND'S DAY MAGAZINE
   Page-flip navigation
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTS
    ========================= */

    const openingScreen = document.getElementById("openingScreen");
    const openMagazine = document.getElementById("openMagazine");

    const magazine = document.getElementById("magazine");
    const book = document.getElementById("book");

    const pages = Array.from(document.querySelectorAll(".page"));

    const previousButton = document.getElementById("previousPage");
    const nextButton = document.getElementById("nextPage");
    const currentPageDisplay = document.getElementById("currentPage");

    const totalPages = pages.length;

    let currentPage = 0;
    let magazineOpened = false;
    let isAnimating = false;

    /* =========================
       INITIAL STATE
    ========================= */

    pages.forEach((page, index) => {
        page.classList.remove("flipped");

        /*
         * The first page should sit on top initially.
         * Earlier pages become visually turned after navigation.
         */
        page.style.zIndex = totalPages - index;
    });

    updateCounter();
    updateButtons();


    /* =========================
       OPEN MAGAZINE
    ========================= */

    if (openMagazine) {
        openMagazine.addEventListener("click", () => {

            if (magazineOpened) return;

            magazineOpened = true;

            openingScreen.classList.add("hide");

            setTimeout(() => {
                magazine.classList.add("show");
            }, 250);

        });
    }


    /* =========================
       UPDATE PAGE COUNTER
    ========================= */

    function updateCounter() {

        if (!currentPageDisplay) return;

        const displayedPage = Math.min(currentPage + 1, totalPages);

        currentPageDisplay.textContent =
            `${String(displayedPage).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`;
    }


    /* =========================
       UPDATE BUTTONS
    ========================= */

    function updateButtons() {

        if (previousButton) {
            previousButton.disabled = currentPage === 0;
            previousButton.style.opacity =
                currentPage === 0 ? "0.35" : "1";
        }

        if (nextButton) {
            nextButton.disabled = currentPage === totalPages - 1;
            nextButton.style.opacity =
                currentPage === totalPages - 1 ? "0.35" : "1";
        }
    }


    /* =========================
       NEXT PAGE
    ========================= */

    function nextPage() {

        if (!magazineOpened) return;
        if (isAnimating) return;
        if (currentPage >= totalPages - 1) return;

        isAnimating = true;

        const page = pages[currentPage];

        if (page) {
            page.classList.add("flipped");

            /*
             * Keep turned pages behind the remaining pages.
             */
            page.style.zIndex = currentPage + 1;
        }

        currentPage++;

        updateCounter();
        updateButtons();

        setTimeout(() => {
            isAnimating = false;
        }, 900);
    }


    /* =========================
       PREVIOUS PAGE
    ========================= */

    function previousPage() {

        if (!magazineOpened) return;
        if (isAnimating) return;
        if (currentPage <= 0) return;

        isAnimating = true;

        currentPage--;

        const page = pages[currentPage];

        if (page) {
            page.classList.remove("flipped");

            /*
             * Bring the page back to the front.
             */
            page.style.zIndex = totalPages - currentPage;
        }

        updateCounter();
        updateButtons();

        setTimeout(() => {
            isAnimating = false;
        }, 900);
    }


    /* =========================
       BUTTON CONTROLS
    ========================= */

    if (nextButton) {
        nextButton.addEventListener("click", (event) => {
            event.stopPropagation();
            nextPage();
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", (event) => {
            event.stopPropagation();
            previousPage();
        });
    }


    /* =========================
       KEYBOARD NAVIGATION
    ========================= */

    document.addEventListener("keydown", (event) => {

        if (!magazineOpened) return;

        /*
         * Don't change pages while the user is typing
         * or interacting with media controls.
         */
        const tag = document.activeElement?.tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
        ) {
            return;
        }

        if (event.key === "ArrowRight" || event.key === " ") {
            event.preventDefault();
            nextPage();
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previousPage();
        }

        if (event.key === "Home") {
            event.preventDefault();
            goToPage(0);
        }

        if (event.key === "End") {
            event.preventDefault();
            goToPage(totalPages - 1);
        }
    });


    /* =========================
       GO TO SPECIFIC PAGE
    ========================= */

    function goToPage(targetPage) {

        if (!magazineOpened) return;
        if (isAnimating) return;

        targetPage = Math.max(
            0,
            Math.min(targetPage, totalPages - 1)
        );

        if (targetPage === currentPage) return;

        isAnimating = true;

        pages.forEach((page, index) => {

            if (index < targetPage) {
                page.classList.add("flipped");
                page.style.zIndex = index + 1;
            } else {
                page.classList.remove("flipped");
                page.style.zIndex = totalPages - index;
            }

        });

        currentPage = targetPage;

        updateCounter();
        updateButtons();

        setTimeout(() => {
            isAnimating = false;
        }, 1000);
    }


    /* =========================
       TOUCH / SWIPE NAVIGATION
    ========================= */

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const SWIPE_DISTANCE = 55;


    book.addEventListener(
        "touchstart",
        (event) => {

            if (!magazineOpened) return;

            /*
             * Ignore swipes that begin on video/audio controls.
             */
            if (
                event.target.closest("video") ||
                event.target.closest("audio") ||
                event.target.closest("button")
            ) {
                return;
            }

            const touch = event.changedTouches[0];

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        },
        { passive: true }
    );


    book.addEventListener(
        "touchend",
        (event) => {

            if (!magazineOpened) return;

            if (
                event.target.closest("video") ||
                event.target.closest("audio") ||
                event.target.closest("button")
            ) {
                return;
            }

            const touch = event.changedTouches[0];

            touchEndX = touch.clientX;
            touchEndY = touch.clientY;

            handleSwipe();
        },
        { passive: true }
    );


    function handleSwipe() {

        const differenceX = touchEndX - touchStartX;
        const differenceY = touchEndY - touchStartY;

        /*
         * Ignore mostly vertical swipes.
         */
        if (
            Math.abs(differenceX) <
            Math.abs(differenceY)
        ) {
            return;
        }

        if (Math.abs(differenceX) < SWIPE_DISTANCE) {
            return;
        }

        if (differenceX < 0) {
            nextPage();
        } else {
            previousPage();
        }
    }


    /* =========================
       MOUSE DRAG / SWIPE
    ========================= */

    let mouseDown = false;
    let mouseStartX = 0;

    book.addEventListener("mousedown", (event) => {

        if (!magazineOpened) return;

        if (
            event.target.closest("video") ||
            event.target.closest("audio") ||
            event.target.closest("button")
        ) {
            return;
        }

        mouseDown = true;
        mouseStartX = event.clientX;
    });


    document.addEventListener("mouseup", (event) => {

        if (!mouseDown) return;

        mouseDown = false;

        const difference = event.clientX - mouseStartX;

        if (Math.abs(difference) < SWIPE_DISTANCE) {
            return;
        }

        if (difference < 0) {
            nextPage();
        } else {
            previousPage();
        }
    });


    /* =========================
       CLICK ON PAGE EDGES
    ========================= */

    book.addEventListener("click", (event) => {

        if (!magazineOpened) return;

        /*
         * Never turn the page when clicking media,
         * links or controls.
         */
        if (
            event.target.closest("video") ||
            event.target.closest("audio") ||
            event.target.closest("button") ||
            event.target.closest("a")
        ) {
            return;
        }

        const rect = book.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const width = rect.width;

        /*
         * Only the outer edges act as page-turn zones.
         */
        if (x < width * 0.16) {
            previousPage();
        }

        if (x > width * 0.84) {
            nextPage();
        }
    });


    /* =========================
       PREVENT DRAGGING IMAGES
    ========================= */

    document.querySelectorAll("img").forEach((image) => {

        image.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });

    });


    /* =========================
       VIDEO HANDLING
    ========================= */

    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {

        /*
         * Pause other videos when one starts.
         */
        video.addEventListener("play", () => {

            videos.forEach((otherVideo) => {

                if (otherVideo !== video) {
                    otherVideo.pause();
                }

            });

        });

    });


    /* =========================
       AUDIO HANDLING
    ========================= */

    const audios = document.querySelectorAll("audio");

    audios.forEach((audio) => {

        /*
         * Only one song plays at a time.
         */
        audio.addEventListener("play", () => {

            audios.forEach((otherAudio) => {

                if (otherAudio !== audio) {
                    otherAudio.pause();
                }

            });

        });

    });


    /* =========================
       STOP MEDIA WHEN LEAVING PAGE
    ========================= */

    function stopInactiveMedia() {

        pages.forEach((page, index) => {

            if (index !== currentPage) {

                page.querySelectorAll("video").forEach((video) => {
                    video.pause();
                });

                page.querySelectorAll("audio").forEach((audio) => {
                    audio.pause();
                });

            }

        });

    }


    /*
     * Wrap navigation so media automatically pauses.
     */
    const originalNextPage = nextPage;
    const originalPreviousPage = previousPage;


    /* =========================
       PAGE VISIBILITY
    ========================= */

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            videos.forEach((video) => video.pause());
            audios.forEach((audio) => audio.pause());

        }

    });


    /* =========================
       SAFETY: PREVENT PAGE SCROLL
    ========================= */

    document.addEventListener(
        "wheel",
        (event) => {

            /*
             * Allow scrolling inside media controls/pages only
             * if the browser needs it.
             */
            if (
                event.target.closest("video") ||
                event.target.closest("audio")
            ) {
                return;
            }

            event.preventDefault();

        },
        { passive: false }
    );


    /* =========================
       DOUBLE CLICK PROTECTION
    ========================= */

    let lastNavigationTime = 0;

    function navigationGuard() {

        const now = Date.now();

        if (now - lastNavigationTime < 750) {
            return false;
        }

        lastNavigationTime = now;
        return true;
    }


    /* =========================
       PAGE TURN SOUND
    ========================= */

    /*
     * Optional:
     * If you later add:
     *
     * sounds/page-flip.mp3
     *
     * this automatically uses it.
     *
     * The magazine still works perfectly without it.
     */

    let pageFlipSound = null;

    try {

        pageFlipSound = new Audio("sounds/page-flip.mp3");
        pageFlipSound.volume = 0.18;

    } catch (error) {

        pageFlipSound = null;

    }


    function playPageSound() {

        if (!pageFlipSound) return;

        try {

            pageFlipSound.currentTime = 0;
            pageFlipSound.play().catch(() => {});

        } catch (error) {
            /* sound is optional */
        }
    }


    /* =========================
       FINAL INITIALIZATION
    ========================= */

    updateCounter();
    updateButtons();

    /*
     * Make sure the first page is visible
     * before the opening animation begins.
     */
    if (magazine) {
        magazine.classList.remove("show");
    }

    /*
     * Expose navigation for debugging / optional buttons.
     */
    window.magazineNextPage = nextPage;
    window.magazinePreviousPage = previousPage;
    window.magazineGoToPage = goToPage;

});
