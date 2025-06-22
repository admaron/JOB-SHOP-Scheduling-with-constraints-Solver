//! Main app
window.onload = () => {

    //* GLOBAL VARIABLES -------------------------------------------------------------------------------------
    const navigationItems = document.querySelectorAll("nav div");
    const viewItems = document.querySelectorAll("main section");
    const importExportButtons = document.querySelectorAll(".import-export");
    const backToDataButtons = document.querySelectorAll(".backToData");

    const importTextarea = document.querySelector("#importExport_import textarea");
    const importBTN = document.querySelector("#importExport_import button");
    const exportTextarea = document.querySelector("#importExport_export textarea");
    const exportBTN = document.querySelector("#importExport_export button");

    const systemParamsNumberOfMachineTypes = document.querySelector("#systemParams_numberOfMachineTypes input");
    const systemParamsnumberOfMachinesOfGivenTypeWrapper = document.querySelector("#systemParams_numberOfMachinesOfGivenType");
    const systemParamsEfficiencyCoefficientWrapper = document.querySelector("#systemParams_efficiencyCoefficient");

    const problemParamsNumberOfJobs = document.querySelector("#problemParams_problemBasicData .field:nth-of-type(1) input");
    const problemParamsMaxNumberOfOperations = document.querySelector("#problemParams_problemBasicData .field:nth-of-type(2) input");
    const problemParamsPriorityRule = document.querySelector("#problemParams_problemBasicData .field:nth-of-type(3) select");
    const problemParamsJobsArrivalTimesWrapper = document.querySelector("#problemParams_JobsArrivalTimes");
    const problemParamsRequiredJobsCompletionTimesWrapper = document.querySelector("#problemParams_JobsCompletionTimes");
    const problemParamsProcessingTimesWrapper = document.querySelector("#problemParams_ProcessingTimes");
    const problemParamsJobsRoutingWrapper = document.querySelector("#problemParams_JobsRouting");

    const constraintsChangeoversButton = document.querySelector("#constraints_Changeovers div");
    const constraintsChangeoversTimesWrapper = document.querySelector("#constraints_ChangeoverTimes");
    const constraintsChangeoverCostsWrapper = document.querySelector("#constraints_ChangeoverCosts");

    const constraintsTransportButton = document.querySelector("#constraints_Transport div");
    const constraintsTransportTimesWrapper = document.querySelector("#constraints_TransportTimes");

    const solutionConflicts = document.querySelector("#solution_Conflicts");
    const solutionChangeovers = document.querySelector("#solution_ChangeoversList");
    const solutionChangeoversWrapper = document.querySelector("#solution_ChangeoversWrapper");
    const solutionTransports = document.querySelector("#solution_TransportList");
    const solutionTransportsWrapper = document.querySelector("#solution_TransportWrapper");

    let machines = [];
    let jobs = [];
    let changeovers = [];
    let transports = [];
    let solutionConflictsData = [];
    let ganttCharts = [];

    let numberOfMachineTypes = 1;
    let numberOfMachinesOfGivenType = [];
    let numberOfJobs = 1;
    let numberOfOperations = 1;

    let solutionToUpdate = true;
    let navView = 0;
    const currentDate = new Date;


    //* BASICS -------------------------------------------------------------------------------------
    //! Copyright year update
    document.querySelectorAll("#copyrightYear").forEach(e => {
        e.innerText = currentDate.getFullYear();
    });

    //! Navigation handler
    navigationItems.forEach((e, i) => {
        e.addEventListener("click", () => {
            window.scrollTo(0, 0);
            navView = i;

            if (i >= 3 && solutionToUpdate) {
                generateSolution();
            }

            if (document.querySelector("nav div.active")) {
                document.querySelector("nav div.active").classList.remove("active");
            }
            e.classList.add("active");

            let oldActive = document.querySelector("section.active");
            oldActive.classList.add('fade-out');

            oldActive.addEventListener('transitionend', function handleTransitionEnd() {
                oldActive.classList.remove('active', 'fade-out');

                viewItems[i + 1].classList.add('active');
                oldActive.removeEventListener('transitionend', handleTransitionEnd);
            }, {
                once: true
            });
        })
    });


    //! Import/Export view handler
    importExportButtons.forEach((e) => {
        e.addEventListener("click", () => {
            window.scrollTo(0, 0);
            document.querySelector("nav div.active").classList.remove("active");

            let oldActive = document.querySelector("section.active");
            oldActive.classList.add('fade-out');

            oldActive.addEventListener('transitionend', function handleTransitionEnd() {
                oldActive.classList.remove('active', 'fade-out');

                viewItems[0].classList.add('active');
                oldActive.removeEventListener('transitionend', handleTransitionEnd);
            }, {
                once: true
            });
        })
    });

    backToDataButtons.forEach((e) => {
        e.addEventListener("click", () => {
            window.scrollTo(0, 0);

            navigationItems[navView].classList.add("active");

            let oldActive = document.querySelector("section.active");
            oldActive.classList.add('fade-out');

            oldActive.addEventListener('transitionend', function handleTransitionEnd() {
                oldActive.classList.remove('active', 'fade-out');

                viewItems[navView + 1].classList.add('active');
                oldActive.removeEventListener('transitionend', handleTransitionEnd);
            }, {
                once: true
            });
        })
    });


    //! Input characters restriction handler
    const numberInputs = document.querySelectorAll('input[type="number"]:not(#systemParams_efficiencyCoefficient input)');
    numberInputs.forEach(input => allowOnlyPositiveDecimals(input));

    function allowOnlyPositiveDecimals(inputElement) {
        inputElement.addEventListener('input', function () {
            let sanitizedValue = this.value.replace(/[^0-9.,]/g, '');

            sanitizedValue = sanitizedValue.replace(/,/g, '.');

            const parts = sanitizedValue.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts[1];
            } else {
                this.value = sanitizedValue;
            }
        });
    }


    //! Initial data setter
    const initialData = {
        numberOfMachineTypes: 5,
        numberOfMachinesOfGivenType: [1, 1, 1, 1, 1],
        efficiencyCoefficient: [1, 1, 1, 1, 1],
        numberOfJobs: 8,
        numberOfOperations: 4,
        priorityRule: "FIFO",
        jobsArrivalTime: [10, 5, 20, 5, 10, 20, 15, 10],
        jobsCompletionTimes: [100, 100, 100, 100, 100, 100, 100, 100],
        jobsProcessingTimes: [10, 25, 10, 15, 10, 15, 20, 15, 20, 20, 10, 10, 15, 10, 10, 20, 25, 10, 0, 20, 0, 20, 0, 10, 0, 15, 0, 0, 0, 10, 0, 0],
        jobsRouting: [1, 2, 2, 1, 3, 2, 5, 4, 2, 1, 4, 3, 5, 3, 1, 5, 3, 5, 0, 4, 0, 1, 0, 1, 0, 4, 0, 0, 0, 5, 0, 0],
        changeoversState: "ON",
        changeoversTimes: [
            [0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0],
            [0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0],
            [0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0],
            [0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0],
            [0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0]
        ],
        changeoversCosts: [5, 5, 7, 2, 1],
        transportState: "ON",
        transportTimes: [0, 10, 10, 10, 10, 10, 0, 10, 10, 10, 10, 10, 0, 10, 10, 10, 10, 10, 0, 10, 10, 10, 10, 10, 0]
    };


    //* SYSTEM PARAMETERS VIEW -------------------------------------------------------------------------------------

    //! Number of machine types handler
    systemParamsNumberOfMachineTypes.addEventListener("change", (e) => {
        solutionToUpdate = true;

        //! Input validation
        let number = e.target.value;
        if (number <= 0 || "") {
            number = 1;
            e.target.value = number;
        }

        if (parseInt(number) >= "50") {
            number = 15;
            e.target.value = number;
        }

        number = parseInt(number);
        e.target.value = number;


        //! Triggers
        numberOfMachineTypes = number;
        updateNumberOfMachinesOfGivenType(numberOfMachineTypes);

        updateChangeoversCost(numberOfMachineTypes);
        updateChangeoversTimes(numberOfJobs);
        updateTransportTimesBetweenMachines();
    });

    //! Number of machines of given type fields update handler
    function updateNumberOfMachinesOfGivenType(number) {
        const children = Array.from(systemParamsnumberOfMachinesOfGivenTypeWrapper.children);
        children.forEach(child => child.remove());

        for (let i = 0; i < number; i++) {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field';

            const p = document.createElement('p');
            p.textContent = `Type ${i+1} machines (M${i+1}):`;

            const input = document.createElement('input');
            input.type = 'number';
            input.value = 1;

            //! Input validation
            allowOnlyPositiveDecimals(input);

            input.addEventListener("change", () => {
                solutionToUpdate = true;

                let value = parseInt(input.value);

                if (value < 1 || input.value == "") {
                    input.value = 1;
                } else if (value > 15) {
                    input.value = 15;
                }

                //! Triggers
                updateEfficiencyCoefficient(1, i, input.value);
                updateTransportTimesBetweenMachines();
                updateChangeoversTimes(numberOfJobs);
            });

            fieldDiv.appendChild(p);
            fieldDiv.appendChild(input);

            systemParamsnumberOfMachinesOfGivenTypeWrapper.appendChild(fieldDiv);
        }

        //! Triggers
        updateEfficiencyCoefficient(0, 0, 1);
    }


    //! Efficiency coefficient for individual machines of a given type fields update handler
    function updateEfficiencyCoefficient(mode, selectedIndex, number) {
        if (mode == 0) {
            numberOfMachinesOfGivenType = [];
            for (let a = 0; a < numberOfMachineTypes; a++) {
                numberOfMachinesOfGivenType.push(number);
            }

            const children = Array.from(systemParamsEfficiencyCoefficientWrapper.children);
            children.forEach(child => child.remove());

            for (let i = 0; i < numberOfMachineTypes; i++) {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'field stacked';

                const p = document.createElement('p');
                p.textContent = `Type ${i+1} (M${i+1}):`;
                fieldDiv.appendChild(p);

                for (let j = 0; j < number; j++) {
                    const innerDiv = document.createElement('div');

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.value = 1;
                    input.step = '0.01';

                    const p = document.createElement('p');
                    p.textContent = `M${i+1}.${j+1}`;

                    innerDiv.appendChild(input);
                    innerDiv.appendChild(p);

                    input.addEventListener('change', (e) => {
                        solutionToUpdate = true;

                        const value = parseFloat(input.value);
                        if (value < 0.01) {
                            input.value = 0.01;
                        } else if (value > 1) {
                            input.value = 1;
                        }
                    });

                    input.addEventListener('input', function () {
                        let sanitizedValue = this.value.trim();

                        sanitizedValue = sanitizedValue.replace(/,/g, '.');
                        sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, '');

                        let parts = sanitizedValue.split('.');
                        if (parts.length > 1) {
                            parts[1] = parts[1].substring(0, 2);
                            sanitizedValue = parts.join('.');
                        }

                        let value = parseFloat(sanitizedValue);

                        if (isNaN(value)) {
                            this.value = '0.01';
                        } else {
                            if (value < 0.01) {
                                this.value = '0.01';
                            } else if (value > 1) {
                                this.value = '1';
                            } else {
                                this.value = sanitizedValue;
                            }
                        }
                    });

                    fieldDiv.appendChild(innerDiv);
                }

                systemParamsEfficiencyCoefficientWrapper.appendChild(fieldDiv);
            }
        } else {
            numberOfMachinesOfGivenType[selectedIndex] = number;

            const fields = Array.from(systemParamsEfficiencyCoefficientWrapper.querySelectorAll('.field.stacked'));
            const selectedField = fields[selectedIndex];

            const innerDivs = Array.from(selectedField.querySelectorAll('div'));

            const excessDivs = innerDivs.slice(number);
            excessDivs.forEach(innerDiv => innerDiv.remove());

            excessDivs.forEach(innerDiv => innerDiv.remove());

            for (let j = innerDivs.length; j < number; j++) {
                const innerDiv = document.createElement('div');

                const input = document.createElement('input');
                input.type = 'number';
                input.value = 1;

                const p = document.createElement('p');
                p.textContent = `M${selectedIndex + 1}.${j + 1}`;

                innerDiv.appendChild(input);
                innerDiv.appendChild(p);

                //! Input validation
                input.addEventListener('change', (e) => {
                    solutionToUpdate = true;

                    const value = parseFloat(input.value);
                    if (value < 0.01) {
                        input.value = 0.01;
                    } else if (value > 1) {
                        input.value = 1;
                    }
                });

                selectedField.appendChild(innerDiv);
            }

            const newInnerDivs = Array.from(selectedField.querySelectorAll('div')).slice(innerDivs.length);
            newInnerDivs.forEach(innerDiv => selectedField.appendChild(innerDiv));
        }
    }


    //* PROBLEM PARAMETERS VIEW -------------------------------------------------------------------------------------

    //! Number of jobs handler
    problemParamsNumberOfJobs.addEventListener("change", (e) => {
        solutionToUpdate = true;

        //! Input validation
        let number = e.target.value;
        if (number <= 0 || "") {
            number = 1;
            e.target.value = number;
        }

        if (parseInt(number) >= "55") {
            number = 15;
            e.target.value = number;
        }

        number = parseInt(number);
        e.target.value = number;

        //! Triggers
        numberOfJobs = number;
        updateJobsArrivalTime(numberOfJobs);
        updateRequiredJobsCompletionTimes(numberOfJobs);
        updateOperationsProcessingTimes(numberOfJobs, numberOfOperations);
        updateJobsRouting(numberOfJobs, numberOfOperations);

        updateChangeoversTimes(numberOfJobs);
    });

    //! Max. number of operations handler
    problemParamsMaxNumberOfOperations.addEventListener("change", (e) => {
        solutionToUpdate = true;

        //! Input validation
        let number = e.target.value;
        if (number <= 0 || "") {
            number = 1;
            e.target.value = number;
        }

        if (parseInt(number) >= "50") {
            number = 15;
            e.target.value = number;
        }

        number = parseInt(number);
        e.target.value = number;

        //! Triggers
        numberOfOperations = number;
        updateOperationsProcessingTimes(numberOfJobs, numberOfOperations);
        updateJobsRouting(numberOfJobs, numberOfOperations);
    });

    //! Prioritu rule handler
    problemParamsPriorityRule.addEventListener("change", (e) => {
        solutionToUpdate = true;
    });

    //! Jobs arrival time update handler
    function updateJobsArrivalTime(number) {
        const children = Array.from(problemParamsJobsArrivalTimesWrapper.children);
        children.forEach(child => child.remove());

        for (let i = 0; i < number; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `J${i+1}`;

            const input = document.createElement('input');
            input.type = 'number';
            input.value = 0;

            //! Input validation
            allowOnlyPositiveDecimals(input);

            input.addEventListener("change", () => {
                solutionToUpdate = true;

                let value = parseInt(input.value);
                if (value > 1000) {
                    value = 1000;
                }

                input.value = value;
            });

            fieldDiv.appendChild(p);
            fieldDiv.appendChild(input);

            problemParamsJobsArrivalTimesWrapper.appendChild(fieldDiv);
        }
    }

    //! Required jobs completion times update handler
    function updateRequiredJobsCompletionTimes(number) {
        const children = Array.from(problemParamsRequiredJobsCompletionTimesWrapper.children);
        children.forEach(child => child.remove());

        for (let i = 0; i < number; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `J${i+1}`;

            const input = document.createElement('input');
            input.type = 'number';
            input.value = 1;

            //! Input validation
            allowOnlyPositiveDecimals(input);

            input.addEventListener("change", () => {
                solutionToUpdate = true;

                let value = parseInt(input.value);
                if (value < 0 || input.value == "") {
                    value = 0;
                    input.value = value;
                } else if (value > 1000) {
                    value = 1000;
                    input.value = value;
                }

                value = parseInt(value);
                input.value = value;
            });

            fieldDiv.appendChild(p);
            fieldDiv.appendChild(input);

            problemParamsRequiredJobsCompletionTimesWrapper.appendChild(fieldDiv);
        }
    }

    //! Operations processing times update handler
    function updateOperationsProcessingTimes(jobs, operations) {
        const children = Array.from(problemParamsProcessingTimesWrapper.children);
        children.forEach(child => child.remove());

        //! Vertical label column
        const fieldDiv = document.createElement('div');
        fieldDiv.className = "titleColumn";

        const p = document.createElement('p');
        p.textContent = `.`;
        fieldDiv.appendChild(p);

        for (let j = 0; j < jobs; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = `J${j+1}`;
            input.disabled = true;
            fieldDiv.appendChild(input);
        }
        problemParamsProcessingTimesWrapper.appendChild(fieldDiv);

        //! Dynamic content columns
        for (let i = 0; i < operations; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `O${i+1}`;
            fieldDiv.appendChild(p);

            for (let j = 0; j < jobs; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = 1;

                //! Input validation
                allowOnlyPositiveDecimals(input);

                input.addEventListener("change", () => {
                    solutionToUpdate = true;

                    let value = parseInt(input.value);
                    if (value < 0 || input.value == "") {
                        value = 0;
                        input.value = value;
                    } else if (value > 1000) {
                        value = 1000;
                        input.value = value;
                    }

                    value = parseInt(value);
                    input.value = value;
                });

                fieldDiv.appendChild(input);
            }

            problemParamsProcessingTimesWrapper.appendChild(fieldDiv);
        }
    }

    //! Jobs routing update handler
    function updateJobsRouting(jobs, operations) {
        const children = Array.from(problemParamsJobsRoutingWrapper.children);
        children.forEach(child => child.remove());

        //! Vertical label column
        const fieldDiv = document.createElement('div');
        fieldDiv.className = "titleColumn";

        const p = document.createElement('p');
        p.textContent = `.`;
        fieldDiv.appendChild(p);

        for (let j = 0; j < jobs; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = `J${j+1}`;
            input.disabled = true;
            fieldDiv.appendChild(input);
        }
        problemParamsJobsRoutingWrapper.appendChild(fieldDiv);

        //! Dynamic content columns
        for (let i = 0; i < operations; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `O${i+1}`;
            fieldDiv.appendChild(p);

            for (let j = 0; j < jobs; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = 1;

                //! Input validation
                allowOnlyPositiveDecimals(input);

                input.addEventListener("change", () => {
                    solutionToUpdate = true;

                    let value = parseInt(input.value);
                    if (value < 0 || input.value == "") {
                        value = 0;
                        input.value = value;
                    } else if (value > numberOfMachineTypes) {
                        value = numberOfMachineTypes;
                        input.value = value;
                    }

                    value = parseInt(value);
                    input.value = value;
                });

                fieldDiv.appendChild(input);
            }

            problemParamsJobsRoutingWrapper.appendChild(fieldDiv);
        }
    }


    //* CONSTRAINTS VIEW -------------------------------------------------------------------------------------

    //! Transport switch handler
    constraintsTransportButton.addEventListener("click", (e) => {
        transportStateSwitch(constraintsTransportButton);
    });

    function transportStateSwitch(e) {
        solutionToUpdate = true;

        let constraintsTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("input:not(.disabled)");

        if (e.innerText == "ON") {
            e.innerText = "OFF";
            constraintsTransportTimes.forEach(e => {
                e.disabled = true;
            });
        } else {
            e.innerText = "ON";
            constraintsTransportTimes.forEach(e => {
                e.disabled = false;
            });
        }
    }

    //! Transport times between machines update handler
    function updateTransportTimesBetweenMachines() {
        const children = Array.from(constraintsTransportTimesWrapper.children);
        children.forEach(child => child.remove());

        //! Vertical label column
        const fieldDiv = document.createElement('div');
        fieldDiv.className = "titleColumn";

        const p = document.createElement('p');
        p.textContent = `.`;
        fieldDiv.appendChild(p);

        numberOfMachinesOfGivenType.forEach((e, i) => {
            for (let j = 0; j < e; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = `M${i+1}.${j+1}`;
                input.disabled = true;
                fieldDiv.appendChild(input);
            }
        });
        constraintsTransportTimesWrapper.appendChild(fieldDiv);

        //! Dynamic content columns
        let numberOfAllMachines = numberOfMachinesOfGivenType.reduce((acc, cur) => acc + parseInt(cur), 0);
        let diagonalSpot = -1;


        numberOfMachinesOfGivenType.forEach((e, n) => {
            for (let i = 0; i < e; i++) {
                diagonalSpot++;
                const fieldDiv = document.createElement('div');

                const p = document.createElement('p');
                p.textContent = `M${n+1}.${i+1}`;
                fieldDiv.appendChild(p);

                for (let j = 0; j < numberOfAllMachines; j++) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.value = 0;

                    //! Input validation
                    allowOnlyPositiveDecimals(input);

                    input.addEventListener("change", () => {
                        solutionToUpdate = true;

                        let value = parseInt(input.value);
                        if (value < 0 || input.value == "") {
                            value = 0;
                            input.value = value;
                        } else if (value > 1000) {
                            value = 1000;
                            input.value = value;
                        }

                        value = parseInt(value);
                        input.value = value;
                    });

                    if (diagonalSpot == j) {
                        input.disabled = true;
                        input.className = "disabled";
                        input.value = 0;
                    }

                    fieldDiv.appendChild(input);
                }

                constraintsTransportTimesWrapper.appendChild(fieldDiv);
            }
        });
    }


    //! Changeovers switch handler
    constraintsChangeoversButton.addEventListener("click", (e) => {
        changeoversStateSwitch(constraintsChangeoversButton);
    });

    function changeoversStateSwitch(e) {
        solutionToUpdate = true;

        let constraintsChangeoversTimes = constraintsChangeoversTimesWrapper.querySelectorAll("input:not(.disabled)");
        let constraintsChangeoverCosts = constraintsChangeoverCostsWrapper.querySelectorAll("input:not(.disabled)");

        if (e.innerText == "ON") {
            e.innerText = "OFF";

            constraintsChangeoversTimes.forEach(e => {
                e.disabled = true;
            });
            constraintsChangeoverCosts.forEach(e => {
                e.disabled = true;
            });
        } else {
            e.innerText = "ON";
            constraintsChangeoversTimes.forEach(e => {
                e.disabled = false;
            });
            constraintsChangeoverCosts.forEach(e => {
                e.disabled = false;
            });
        }
    }

    //! Changeovers times update handler
    function updateChangeoversTimes(jobs) {
        const children = Array.from(constraintsChangeoversTimesWrapper.children);
        children.forEach(child => child.remove());

        for (let mm = 0; mm < numberOfMachineTypes; mm++) {
            for (let m = 0; m < numberOfMachinesOfGivenType[mm]; m++) {
                const changeoversTimeWrapper = document.createElement('div');

                //! Machine type label
                const label = document.createElement('p');
                label.textContent = "For Machine " + (mm + 1) + "." + (m + 1) + ":";
                changeoversTimeWrapper.appendChild(label);

                //! Vertical label column
                const fieldDiv = document.createElement('div');
                fieldDiv.className = "titleColumn";

                const p = document.createElement('p');
                p.textContent = `.`;
                fieldDiv.appendChild(p);

                for (let j = 0; j < jobs; j++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = `J${j+1}`;
                    input.disabled = true;
                    fieldDiv.appendChild(input);
                }
                changeoversTimeWrapper.appendChild(fieldDiv);

                //! Dynamic content columns
                for (let i = 0; i < jobs; i++) {
                    const fieldDiv = document.createElement('div');

                    const p = document.createElement('p');
                    p.textContent = `J${i+1}`;
                    fieldDiv.appendChild(p);

                    for (let j = 0; j < jobs; j++) {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.value = 0;

                        if (i == j) {
                            input.disabled = true;
                            input.className = "disabled";
                        }

                        //! Input validation
                        allowOnlyPositiveDecimals(input);

                        input.addEventListener("change", () => {
                            solutionToUpdate = true;

                            let value = parseInt(input.value);
                            if (value < 0 || input.value == "") {
                                value = 0;
                                input.value = value;
                            } else if (value > 1000) {
                                value = 1000;
                                input.value = value;
                            }

                            value = parseInt(value);
                            input.value = value;
                        });

                        fieldDiv.appendChild(input);
                    }

                    changeoversTimeWrapper.appendChild(fieldDiv);
                }

                constraintsChangeoversTimesWrapper.appendChild(changeoversTimeWrapper);
            }
        }
    }

    //! Changeovers cost update handler
    function updateChangeoversCost(number) {
        const children = Array.from(constraintsChangeoverCostsWrapper.children);
        children.forEach(child => child.remove());

        for (let i = 0; i < number; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `M${i+1}`;

            const input = document.createElement('input');
            input.type = 'number';
            input.value = 0;

            //! Input validation
            allowOnlyPositiveDecimals(input);

            input.addEventListener("change", () => {
                solutionToUpdate = true;

                let value = parseInt(input.value);
                if (value < 0 || input.value == "") {
                    value = 0;
                    input.value = value;
                } else if (value > 1000) {
                    value = 1000;
                    input.value = value;
                }

                value = parseInt(value);
                input.value = value;
            });

            fieldDiv.appendChild(p);
            fieldDiv.appendChild(input);

            constraintsChangeoverCostsWrapper.appendChild(fieldDiv);
        }
    }



    //* SOLUTION VIEW -------------------------------------------------------------------------------------

    //! Solution calculation handler
    function generateSolution() {
        solutionToUpdate = false;

        machines = [];
        jobs = [];
        solutionConflictsData = [];

        generateMachines();
        generateJobs();
        generateChangeovers();
        generateTransports();

        solutionConflicts.querySelectorAll('p').forEach(p => p.remove());
        solutionChangeovers.querySelectorAll('p').forEach(p => p.remove());
        solutionTransports.querySelectorAll('p').forEach(p => p.remove());

        if (changeovers.state == 0) {
            solutionChangeoversWrapper.classList.add("hide");
        } else {
            solutionChangeoversWrapper.classList.remove("hide");
        }

        if (transports.state == 0) {
            solutionTransportsWrapper.classList.add("hide");
        } else {
            solutionTransportsWrapper.classList.remove("hide");
        }

        //! Infinite loop prevention bound
        let safetyBound = (jobs.reduce((total, obj) => {
            const operationsSum = obj.operationsTimes.reduce((sum, time) => sum + time, 0);
            return total + operationsSum;
        }, 0)) * 5;

        let waitingQueue = Array.from({
            length: numberOfMachineTypes
        }, () => []);

        for (let i = 0; i < safetyBound; i++) {

            //! Check if any job became available
            const selectedJobs = jobs.filter(obj => obj.availability == i).map(obj => obj);

            if (selectedJobs.length >= 1) {
                selectedJobs.forEach(j => {
                    if ((j.routing[j.operation] - 1) >= 0) { //! Check if routing is not over
                        waitingQueue[(j.routing[j.operation] - 1)].push(j);
                    }
                });
            }


            for (let m = 0; m < numberOfMachineTypes; m++) {
                if (waitingQueue[m].length > 0) { //! Check if any job is waiting for machine
                    let index = 0;

                    while (index < waitingQueue[m].length) {
                        const e = waitingQueue[m][index];
                        const matchingMachines = machines.filter(machine => machine.type === (m + 1));
                        const baseSelectedMachines = matchingMachines.filter(machine => machine.availability <= i);
                        const selectedMachines = baseSelectedMachines.filter(machine => machine.ID !== e.prevMachineID[1]);

                        if (selectedMachines.length >= 1) {
                            let selectedMachine = selectMachine(selectedMachines);

                            if (waitingQueue[m].length > 1) {
                                addConflict(waitingQueue[m], selectedMachine, i);
                            }

                            assignJob(solveConflict(waitingQueue[m]), selectedMachine, i);
                        } else {
                            index++;
                        }
                    };
                }
            }
        }

        function solveConflict(jobs) {
            switch (problemParamsPriorityRule.value) {
                case "FIFO":
                    return solveFIFO(jobs);
                    break;
                case "LIFO":
                    return solveLIFO(jobs);
                    break;
                case "SPT":
                    return solveSPT(jobs);
                    break;
                case "LPT":
                    return solveLPT(jobs);
                    break;
                case "EDD":
                    return solveEDD(jobs);
                    break;
                case "LWR":
                    return solveLWR(jobs);
                    break;
            }


            //! FIFO rule conflict solution handler
            function solveFIFO(jobs) {
                let solution = jobs[0];
                jobs.shift();
                return solution;
            }

            //! LIFO rule conflict solution handler
            function solveLIFO(jobs) {
                let solution = jobs[jobs.length - 1];
                jobs.pop();
                return solution;
            }

            //! SPT rule conflict solution handler
            function solveSPT(jobs) {
                let minIndex = 0;
                let minValue = jobs[0].operationsTimes[jobs[0].operation];

                for (let i = 1; i < jobs.length; i++) {
                    const currentValue = jobs[i].operationsTimes[jobs[i].operation];

                    if (
                        currentValue < minValue ||
                        (currentValue === minValue && jobs[i].ID < jobs[minIndex].ID)
                    ) {
                        minValue = currentValue;
                        minIndex = i;
                    }
                }


                let solution = jobs[minIndex];
                jobs.splice(minIndex, 1);
                return solution;
            }

            //! LPT rule conflict solution handler
            function solveLPT(jobs) {
                let maxIndex = 0;
                let maxValue = jobs[0].operationsTimes[jobs[0].operation];

                for (let i = 1; i < jobs.length; i++) {
                    const currentValue = jobs[i].operationsTimes[jobs[i].operation];

                    if (
                        currentValue > maxValue ||
                        (currentValue == maxValue && jobs[i].ID < jobs[maxIndex].ID)
                    ) {
                        maxValue = currentValue;
                        maxIndex = i;
                    }
                }

                let solution = jobs[maxIndex];
                jobs.splice(maxIndex, 1);
                return solution;
            }

            //! LWR rule conflict solution handler
            function solveEDD(jobs) {
                let minIndex = 0;
                let minSum = Infinity;

                for (let i = 0; i < jobs.length; i++) {
                    const totalOperationsTime = jobs[i].operationsTimes.reduce((sum, time) => sum + time, 0);
                    const currentSum = totalOperationsTime + jobs[i].arrival;

                    if (currentSum < minSum || (currentSum === minSum && jobs[i].ID < jobs[minIndex].ID)) {
                        minSum = currentSum;
                        minIndex = i;
                    }
                }

                let solution = jobs[minIndex];
                jobs.splice(minIndex, 1);
                return solution;
            }

            //! LWR rule conflict solution handler
            function solveLWR(jobs) {
                let minIndex = 0;
                let minSum = Infinity;

                for (let i = 0; i < jobs.length; i++) {
                    const startIndex = jobs[i].operation;

                    const totalOperationsTime = jobs[i].operationsTimes
                        .slice(startIndex)
                        .reduce((sum, time) => sum + time, 0);


                    if (totalOperationsTime < minSum || (totalOperationsTime === minSum && jobs[i].ID < jobs[minIndex].ID)) {
                        minSum = totalOperationsTime;
                        minIndex = i;
                    }
                }

                let solution = jobs[minIndex];
                jobs.splice(minIndex, 1);
                return solution;
            }

        }

        function selectMachine(machineGroup) {
            machineGroup.sort((a, b) => {
                if (b.efficiency !== a.efficiency) {
                    return b.efficiency - a.efficiency;
                } else {
                    return a.ID - b.ID;
                }
            });

            return machineGroup[0];
        }

        function addConflict(jobs, machine, timestamp) {
            const p = document.createElement('p');

            let jobsIDs = "";
            jobs.forEach((e, i) => {
                if (i < (jobs.length - 1)) {
                    jobsIDs += e.ID + "." + (e.operation + 1) + " | ";
                } else {
                    jobsIDs += e.ID + "." + (e.operation + 1);
                }
            });

            const operationsSpan = document.createElement('span');
            operationsSpan.textContent = `Operations: ${jobsIDs}`;

            const conflictTimeSpan = document.createElement('span');
            conflictTimeSpan.textContent = `Conflict Time: ${timestamp}`;

            const conflictMachineSpan = document.createElement('span');
            conflictMachineSpan.textContent = `Machine: ${machine.ID}`;

            p.appendChild(operationsSpan);
            p.appendChild(conflictTimeSpan);
            p.appendChild(conflictMachineSpan);

            solutionConflicts.appendChild(p);
            solutionConflictsData.push(createMConflictObject(jobsIDs, timestamp, machine.ID));

            function createMConflictObject(jobID, timestamp, machineID) {
                return {
                    jobID: jobID,
                    timestamp: timestamp,
                    machineID: machineID
                };
            }
        }

        function addChangeover(jobs, machine, timestamp, requiredTime) {
            const p = document.createElement('p');

            let time = "";
            timestamp.forEach((e, i) => {
                if (i < (timestamp.length - 1)) {
                    time += e + " - ";
                } else {
                    time += e;
                }
            });

            const machineSpan = document.createElement('span');
            machineSpan.textContent = `Machine: ${machine.ID}`;

            const operationSpan = document.createElement('span');
            operationSpan.textContent = `Operation: ${jobs.ID}.${jobs.operation+1}`;

            const timeSpan = document.createElement('span');
            timeSpan.textContent = `Time: ${time}`;

            p.appendChild(machineSpan);
            p.appendChild(operationSpan);
            p.appendChild(timeSpan);

            solutionChangeovers.appendChild(p);

            changeovers.totalCost += (changeovers.cost[machine.type - 1] * requiredTime);

            let lineupEntry = {
                x: [timestamp[0], timestamp[1]],
                y: "M" + machine.ID
            }
            machine.changeovers.push(lineupEntry);
            machine.changeoversLabels.push(jobs.ID + "." + (jobs.operation + 1));
        }

        function sortInformation(solutionElement) {
            const paragraphs = Array.from(solutionElement.querySelectorAll('p'));

            paragraphs.sort((a, b) => {
                const timeA = parseInt(a.querySelector('span:nth-child(3)').textContent.match(/(\d+)\s*-\s*\d+/)[1], 10);
                const timeB = parseInt(b.querySelector('span:nth-child(3)').textContent.match(/(\d+)\s*-\s*\d+/)[1], 10);
                return timeA - timeB;
            });

            solutionElement.querySelectorAll('p').forEach(p => p.remove());
            paragraphs.forEach(p => solutionElement.appendChild(p));
        }

        function addTransport(jobs, machine, timestamp) {
            const p = document.createElement('p');

            let time = "";
            timestamp.forEach((e, i) => {
                if (i < (timestamp.length - 1)) {
                    time += e + " - ";
                } else {
                    time += e;
                }
            });

            const operationSpan = document.createElement('span');
            operationSpan.textContent = `Operation: ${jobs.ID}.${jobs.operation+1}`;

            const machineSpan = document.createElement('span');
            machineSpan.textContent = `Destination: M${machine.ID}`;

            const timeSpan = document.createElement('span');
            timeSpan.textContent = `Time: ${time}`;


            p.appendChild(operationSpan);
            p.appendChild(machineSpan);
            p.appendChild(timeSpan);

            solutionTransports.appendChild(p);

            let lineupEntry = {
                x: [timestamp[0], timestamp[1]],
                y: "J" + jobs.ID
            }
            jobs.transport.push(lineupEntry);
            jobs.transportLabels.push(jobs.ID + "." + (jobs.operation + 1) + " > M" + machine.ID);
        }

        function assignJob(job, machine, timestamp) {
            let changeoverTime = 0;
            job.prevMachineID[0] = job.prevMachineID[1];
            job.prevMachineID[1] = machine.ID;

            if (machine.lineup.length == 0) {
                checkForTransport();
            } else {
                if (changeovers.state == 1) {
                    let machineNR = machine.ID.split(".");
                    changeoverTime = changeovers.times[(machine.type - 1) + (machineNR[1] - 1)][machine.jobs[machine.jobs.length - 1] - 1][job.ID - 1];

                    if (machine.availability < timestamp) {
                        addChangeover(job, machine, [machine.availability, (machine.availability + changeoverTime)], changeoverTime);
                        changeoverTime = Math.max(0, changeoverTime - (timestamp - machine.availability));
                    } else {
                        addChangeover(job, machine, [timestamp, (timestamp + changeoverTime)], changeoverTime);
                    }

                }

                checkForTransport();
            }

            function checkForTransport() {
                if (transports.state == 0) {
                    assignJobToMachine(job, machine, timestamp, changeoverTime);
                } else {
                    if (job.operation > 0) {
                        applyTransport(job, machine, timestamp, changeoverTime);
                    } else {
                        assignJobToMachine(job, machine, timestamp, changeoverTime);
                    }
                }

                function applyTransport(jobs, machine, timestamp, changeoverTime) {
                    let transportTime = jobs.availability;
                    let transportStart = transportTime;
                    let prevSplit = jobs.prevMachineID[0].split(".");
                    let curSplit = jobs.prevMachineID[1].split(".");

                    transportTime += transports.times[sumFirstNElements(parseInt(prevSplit[0]) - 1) + parseInt(prevSplit[1]) - 1][sumFirstNElements(parseInt(curSplit[0]) - 1) + parseInt(curSplit[1]) - 1];

                    if ((timestamp + changeoverTime) < transportTime) {
                        changeoverTime = 0;

                        if (transportTime > timestamp) {
                            timestamp = transportTime;
                        }
                    }

                    addTransport(jobs, machine, [transportStart, transportTime])
                    assignJobToMachine(jobs, machine, timestamp, changeoverTime);

                    function sumFirstNElements(count) {
                        return numberOfMachinesOfGivenType
                            .slice(0, count)
                            .reduce((acc, current) => {
                                let num = parseFloat(current);
                                return isNaN(num) ? acc : acc + num;
                            }, 0);
                    }
                }
            }

            function assignJobToMachine(job, machine, timestamp, changeoverTime) {
                let lineupEntry = {
                    x: [changeoverTime + timestamp, changeoverTime + timestamp + (job.operationsTimes[job.operation] + Math.ceil(job.operationsTimes[job.operation] * (1 - machine.efficiency)))],
                    y: "M" + machine.ID
                }
                machine.lineup.push(lineupEntry);
                machine.lineupLabels.push(job.ID + "." + (job.operation + 1));
                machine.availability = changeoverTime + timestamp + (job.operationsTimes[job.operation] + Math.ceil(job.operationsTimes[job.operation] * (1 - machine.efficiency)));

                machine.jobs.push(job.ID);

                job.availability = changeoverTime + timestamp + (job.operationsTimes[job.operation] + Math.ceil(job.operationsTimes[job.operation] * (1 - machine.efficiency)));
                job.operation++;
            }

        }

        generateGanttChart();
        sortInformation(solutionChangeovers);
        sortInformation(solutionTransports);

        generateEvaluation();
    }


    //! Machines objects creation function
    function generateMachines() {
        let efficiencyCoefficientsWrapper = systemParamsEfficiencyCoefficientWrapper.querySelectorAll(".field");

        for (let i = 0; i < numberOfMachineTypes; i++) {
            for (let j = 0; j < numberOfMachinesOfGivenType[i]; j++) {
                let id = (i + 1) + "." + (j + 1);
                let efficiencyCoefficient = efficiencyCoefficientsWrapper[i].querySelectorAll("input");

                machines.push(createMachineObject(id, (i + 1), parseFloat(efficiencyCoefficient[j].value)));
            }
        }

        function createMachineObject(id, type, efficiency) {
            return {
                ID: id,
                type: type,
                efficiency: efficiency,
                availability: 0,
                lineup: [],
                lineupLabels: [],
                jobs: [],
                changeovers: [],
                changeoversLabels: []
            };
        }
    }


    //! Jobs objects creation function
    function generateJobs() {

        for (let i = 0; i < numberOfJobs; i++) {
            let arrivals = problemParamsJobsArrivalTimesWrapper.querySelectorAll("input");
            let requiredComplitions = problemParamsRequiredJobsCompletionTimesWrapper.querySelectorAll("input");

            let operationsTimes = [];
            problemParamsProcessingTimesWrapper.querySelectorAll("div:not(.titleColumn)").forEach(e => {
                operationsTimes.push(parseInt(e.querySelector(`input:nth-of-type(${i+1})`).value));
            });

            let routing = [];
            problemParamsJobsRoutingWrapper.querySelectorAll("div:not(.titleColumn)").forEach(e => {
                routing.push(parseInt(e.querySelector(`input:nth-of-type(${i+1})`).value));
            });

            jobs.push(createJobObject((i + 1), parseInt(arrivals[i].value), parseInt(requiredComplitions[i].value), 0, operationsTimes, routing));
        }

        function createJobObject(id, arrival, requiredComplition, complition, operationsTimes, routing) {
            return {
                ID: id,
                arrival: arrival,
                requiredComplition: requiredComplition,
                complition: complition,
                operationsTimes: operationsTimes,
                routing: routing,
                operation: 0,
                availability: arrival,
                prevMachineID: ["0", "0"],
                transport: [],
                transportLabels: []
            };
        }
    }


    //! Changeovers object creation function
    function generateChangeovers() {
        let state = constraintsChangeoversButton.innerText == "OFF" ? 0 : 1;

        let times = [];

        const changeoversTimes = Array.from(constraintsChangeoversTimesWrapper.children);
        changeoversTimes.forEach(e => {
            let tmpTimes = []
            let timeColumns = e.querySelectorAll("div:not(.titleColumn)");

            for (let i = 0; i < timeColumns.length; i++) {
                let row = [];

                for (let j = 0; j < timeColumns.length; j++) {
                    row.push(parseInt(timeColumns[j].querySelector(`input:nth-of-type(${i+1})`).value));
                }

                tmpTimes.push(row);
            }

            times.push(tmpTimes);
        });

        let costs = [];
        constraintsChangeoverCostsWrapper.querySelectorAll("input").forEach(e => {
            costs.push(parseInt(e.value));
        });

        changeovers = createChangeoverObject(state, times, costs);

        function createChangeoverObject(state, times, cost) {
            return {
                state: state,
                times: times,
                cost: cost,
                totalCost: 0
            };
        }
    }


    //! Transport object creation function
    function generateTransports() {
        let state = constraintsTransportButton.innerText == "OFF" ? 0 : 1;
        let numberOfAllMachines = numberOfMachinesOfGivenType.reduce((acc, cur) => acc + parseInt(cur), 0);

        let times = [];
        let timesColumns = constraintsTransportTimesWrapper.querySelectorAll("div:not(.titleColumn)");
        for (let i = 0; i < numberOfAllMachines; i++) {
            let row = [];

            for (let j = 0; j < numberOfAllMachines; j++) {
                row.push(parseInt(timesColumns[j].querySelector(`input:nth-of-type(${i+1})`).value));
            }

            times.push(row);
        }

        transports = createTransportObject(state, times);

        function createTransportObject(state, times) {
            return {
                state: state,
                times: times
            };
        }
    }

    //! Gantt chart creation function
    function generateGanttChart() {
        const datasetLabels = [];

        function createConfig(yLabels = []) {
            return {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: maxTime
                        },
                        y: {
                            type: 'category',
                            labels: yLabels,
                            beginAtZero: true,
                            stacked: true,
                            grid: {
                                display: false
                            }
                        },
                        y_conflicts: {
                            type: 'category',
                            labels: yLabels,
                            offset: true,
                            stacked: false,
                            position: 'left',
                            display: false,
                            ticks: {
                                mirror: true
                            }
                        }
                    },
                    plugins: {
                        datalabels: {
                            anchor: 'center',
                            align: 'center',
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            formatter: (value, context) => {
                                return context.chart.data.datasets[context.datasetIndex].label;
                            }
                        },
                        legend: {
                            display: false
                        }
                    },
                    animation: {
                        x: {
                            duration: 500
                        },
                        y: {
                            duration: 0
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        }

        let jobsColors = [];
        for (let i = 0; i < jobs.length; i++) {
            jobsColors.push(randomColorGenerator());
        }


        if (ganttCharts.length > 0) {
            ganttCharts.forEach(e => {
                e.destroy();
            });
        }

        const uniqueSortedMachines = machines
            .filter(machine => Array.isArray(machine.lineup) && machine.lineup.length > 0)
            .map(machine => "M" + machine.ID)
            .sort((a, b) => {
                const [aMain, aSub] = a.slice(1).split('.').map(Number);
                const [bMain, bSub] = b.slice(1).split('.').map(Number);
                return aMain - bMain || aSub - bSub;
            });

        const baseHeightPerRow = 13;
        const minHeight = 125;
        const totalHeight = Math.max(minHeight, uniqueSortedMachines.length * baseHeightPerRow);
        const totalHeight2 = Math.max(minHeight, jobs.length * baseHeightPerRow);

        document.querySelector('#solution_GanttChart').height = totalHeight;
        document.querySelector('#solution_ChangeoversGanttChart').height = totalHeight;
        document.querySelector('#solution_TransportGanttChart').height = totalHeight2;

        let maxTime = 0;
        machines.forEach(machine => {
            if (Array.isArray(machine.lineup)) {
                machine.lineup.forEach(op => {
                    maxTime = Math.max(maxTime, op.x[1]);
                });
            }
        });

        ganttCharts[0] = new Chart(
            document.querySelector('#solution_GanttChart'),
            createConfig(uniqueSortedMachines)
        );

        if (Array.isArray(solutionConflictsData)) {
            const conflictDots = [];

            solutionConflictsData.sort((a, b) => {
                const [aMain, aSub] = a.machineID.split('.').map(Number);
                const [bMain, bSub] = b.machineID.split('.').map(Number);

                return aMain - bMain || aSub - bSub;
            });

            solutionConflictsData.forEach(conflict => {
                conflictDots.push({
                    x: conflict.timestamp,
                    y: "M" + conflict.machineID,
                    jobs: conflict.jobID
                });
            });

            ganttCharts[0].options.plugins.tooltip.callbacks = {
                title: function (tooltipItems) {
                    const point = tooltipItems[0].raw;
                    return `Operations: ${point.jobs}`;
                },
                label: function (context) {
                    const point = context.raw;
                    return `Conflict Time: ${point.x}, Machine: ${point.y}`;
                }
            };
            ganttCharts[0].options.plugins.tooltip.callbacks = {
                title: function (tooltipItems) {
                    const datasetLabel = tooltipItems[0].dataset.label;
                    const point = tooltipItems[0].raw;

                    if (datasetLabel === 'Conflicts') {
                        return `Conflict: ${point.jobs}`;
                    }

                    return `Operation: ${tooltipItems[0].dataset.label}`;
                },
                label: function (context) {
                    const datasetLabel = context.dataset.label;
                    const point = context.raw;

                    if (datasetLabel === 'Conflicts') {
                        return `Time: ${point.x}, Machine: ${point.y}`;
                    }

                    return `Time: ${point.x[0]}-${point.x[1]}, Machine: ${point.y}`;
                }
            };


            ganttCharts[0].data.datasets.push({
                yAxisID: 'y_conflicts',
                label: 'Conflicts',
                data: conflictDots,
                type: 'scatter',
                pointRadius: 8,
                hoverRadius: 8,
                borderColor: '#000',
                pointStyle: 'line',
                rotation: 90,
                borderWidth: 5,
                hoverBorderWidth: 5,
                showLine: false,
                parsing: {
                    xAxisKey: 'x',
                    yAxisKey: 'y'
                },
                datalabels: {
                    display: false
                }
            });
        }

        machines.forEach(e => {
            e.lineupLabels.forEach((l, i) => {
                let jobID = l.split(".");
                addData(ganttCharts[0], l, e.lineup[i], jobsColors[jobID[0]]);
            });
        });

        if (changeovers.state == 1) {
            ganttCharts[1] = new Chart(
                document.querySelector('#solution_ChangeoversGanttChart'),
                createConfig(uniqueSortedMachines)
            );

            datasetLabels.length = 0;

            machines.forEach(e => {
                e.changeoversLabels.forEach((l, i) => {
                    let jobID = l.split(".");
                    addData(ganttCharts[1], l, e.changeovers[i], jobsColors[jobID[0]]);
                });
            });
        }

        if (transports.state == 1) {
            const transportJobsSet = new Set();

            jobs.forEach(job => {
                if (Array.isArray(job.transport) && job.transport.length > 0) {
                    transportJobsSet.add("J" + job.ID);
                }
            });

            const uniqueSortedJobs = Array.from(transportJobsSet).sort((a, b) => {
                const aID = parseInt(a.slice(1), 10);
                const bID = parseInt(b.slice(1), 10);
                return aID - bID;
            });

            ganttCharts[2] = new Chart(
                document.querySelector('#solution_TransportGanttChart'),
                createConfig(uniqueSortedJobs)
            );

            datasetLabels.length = 0;

            jobs.forEach(e => {
                e.transportLabels.forEach((l, i) => {
                    let jobID = l.match(/\d+(?=\.)/);
                    addData(ganttCharts[2], l, e.transport[i], jobsColors[jobID[0]]);
                });
            });
        }

        ganttCharts[0].update();

        function addData(chart, label, data, color) {
            const newData = {
                label: label,
                data: [data],
                backgroundColor: color
            }

            datasetLabels.push(label);

            chart.data.datasets.push(newData);
        }

        function randomColorGenerator() {
            const getRandomLightValue = () => Math.floor(Math.random() * 128) + 128;
            const r = getRandomLightValue();
            const g = getRandomLightValue();
            const b = getRandomLightValue();

            const randomColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

            return randomColor;
        }
    }


    //* SCHEDULE EVALUATION -------------------------------------------------------------------------------------
    function generateEvaluation() {

        //! Deadlines for completion of all jobs
        document.querySelector("#qualityIndicators_Deadlines input").value = Math.max(...jobs.map(job => job.availability));

        const totalAvailability = jobs.reduce((sum, job) => sum + job.availability, 0);
        document.querySelector("#qualityIndicators_SumOfDeadlines input").value = totalAvailability;

        const avgDedline = totalAvailability / jobs.length;
        document.querySelector("#qualityIndicators_AvarageDeadline input").value = Math.round((avgDedline + Number.EPSILON) * 100) / 100;


        //! Delays in job completion
        const differences = jobs.map(job => job.availability - job.requiredComplition);
        document.querySelector("#qualityIndicators_MaxComplitionDelay input").value = Math.max(...differences);

        const sumOfDifferences = differences.reduce((sum, diff) => sum + diff, 0);
        document.querySelector("#qualityIndicators_SumOfComplitionDelays input").value = sumOfDifferences;

        const avgComplitionDelay = sumOfDifferences / differences.length;
        document.querySelector("#qualityIndicators_AvarageComplitionDelay input").value = Math.round((avgComplitionDelay + Number.EPSILON) * 100) / 100;


        //! Job delays
        const differences2 = jobs.map(job => {
            const difference = job.availability - job.requiredComplition;
            return difference > 0 ? difference : 0;
        });
        document.querySelector("#qualityIndicators_MaxDelay input").value = Math.max(...differences2);

        const sumOfDifferences2 = differences2.reduce((sum, diff) => sum + diff, 0);
        document.querySelector("#qualityIndicators_SumOfDelays input").value = sumOfDifferences2;

        const avgDelays = sumOfDifferences2 / differences2.length;
        document.querySelector("#qualityIndicators_AvarageDelay input").value = Math.round((avgDelays + Number.EPSILON) * 100) / 100;


        //! Job flow times
        const flowtime = jobs.map(job => job.availability - job.arrival);
        document.querySelector("#qualityIndicators_MaxFlowTume input").value = Math.max(...flowtime);

        const sumOfFlowtimes = flowtime.reduce((sum, diff) => sum + diff, 0);
        document.querySelector("#qualityIndicators_SumOfFlowTimes input").value = sumOfFlowtimes;

        const avgFlowtime = sumOfFlowtimes / flowtime.length;
        document.querySelector("#qualityIndicators_AvarageFlowTime input").value = Math.round((avgFlowtime + Number.EPSILON) * 100) / 100;


        //! Job waiting times
        const totalOperationsTimes = jobs.map(job => {
            return job.operationsTimes.reduce((sum, time) => sum + time, 0);
        });
        const waitingTime = jobs.map((job, index) => {
            return flowtime[index] - totalOperationsTimes[index];
        });
        document.querySelector("#qualityIndicators_MaxWaitingTime input").value = Math.max(...waitingTime);

        const sumOfWaitingTime = waitingTime.reduce((sum, diff) => sum + diff, 0);
        document.querySelector("#qualityIndicators_SumOfWaitingTimes input").value = sumOfWaitingTime;

        const avgWaitingTime = sumOfWaitingTime / waitingTime.length;
        document.querySelector("#qualityIndicators_AvarageWaitingTime input").value = Math.round((avgWaitingTime + Number.EPSILON) * 100) / 100;


        //! Downtime of all machines
        let idleTime = 0;
        machines.forEach(e => {
            const totalDifference = e.lineup.reduce((sum, item) => {
                const [start, end] = item.x;
                return sum + (end - start);
            }, 0);

            idleTime += e.availability - totalDifference;
        });
        document.querySelector("#qualityIndicators_IdleTime input").value = idleTime;

        document.querySelector("#qualityIndicators_ChangeoversCost input").value = changeovers.totalCost;
        /*if (changeovers.state == 1) {
            document.querySelector("#qualityIndicators_ChangeoversCost input").value = changeovers.totalCost;
        } else {
            document.querySelector("#qualityIndicators_ChangeoversCost input").value = "0";
        }*/
    }


    //* IMPORT / EXPORT -------------------------------------------------------------------------------------
    importData(initialData); //! Initial data load

    //! Import button handler
    importBTN.addEventListener("click", () => {
        let importedData;

        try {
            importedData = JSON.parse(importTextarea.value);
        } catch (e) {
            alert("Błąd: Niepoprawny format JSON.");
            return;
        }

        try {
            validateImportedData(importedData);
        } catch (e) {
            alert("Błąd walidacji: " + e.message);
            return;
        }

        importData(importedData);
        navigationItems[0].click();
    });


    //! Export button handler
    exportBTN.addEventListener("click", () => {
        exportData();
    });


    //! Import function
    function importData(data) {
        let importedData = data;
        const event = new Event("change");

        //! System parameters
        systemParamsNumberOfMachineTypes.value = importedData.numberOfMachineTypes;
        systemParamsNumberOfMachineTypes.dispatchEvent(event);

        const inputNumberOfMachinesOfGivenType = systemParamsnumberOfMachinesOfGivenTypeWrapper.querySelectorAll("input");
        for (let i = 0; i < inputNumberOfMachinesOfGivenType.length; i++) {
            inputNumberOfMachinesOfGivenType[i].value = importedData.numberOfMachinesOfGivenType[i];
            inputNumberOfMachinesOfGivenType[i].dispatchEvent(event);
        }

        const inputEfficiencyCoefficient = systemParamsEfficiencyCoefficientWrapper.querySelectorAll("input");
        for (let i = 0; i < inputEfficiencyCoefficient.length; i++) {
            inputEfficiencyCoefficient[i].value = importedData.efficiencyCoefficient[i];
        }

        //! Problem parameters
        problemParamsNumberOfJobs.value = importedData.numberOfJobs;
        problemParamsNumberOfJobs.dispatchEvent(event);

        problemParamsMaxNumberOfOperations.value = importedData.numberOfOperations;
        problemParamsMaxNumberOfOperations.dispatchEvent(event);

        problemParamsPriorityRule.value = importedData.priorityRule;

        const inputArrival = problemParamsJobsArrivalTimesWrapper.querySelectorAll("input");
        for (let i = 0; i < inputArrival.length; i++) {
            inputArrival[i].value = importedData.jobsArrivalTime[i];
        }

        const inputComplitionTimes = problemParamsRequiredJobsCompletionTimesWrapper.querySelectorAll("input");
        for (let i = 0; i < inputComplitionTimes.length; i++) {
            inputComplitionTimes[i].value = importedData.jobsCompletionTimes[i];
        }

        const inputTimes = problemParamsProcessingTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputTimes.length; i++) {
            inputTimes[i].value = importedData.jobsProcessingTimes[i];
        }

        const inputRouting = problemParamsJobsRoutingWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputRouting.length; i++) {
            inputRouting[i].value = importedData.jobsRouting[i];
        }

        //! Constraints
        if (importedData.transportState == "ON") {
            constraintsTransportButton.innerText = "OFF";
        } else {
            constraintsTransportButton.innerText = "ON";
        }
        transportStateSwitch(constraintsTransportButton);

        const inputTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputTransportTimes.length; i++) {
            inputTransportTimes[i].value = importedData.transportTimes[i];
        }

        if (importedData.changeoversState == "ON") {
            constraintsChangeoversButton.innerText = "OFF";
        } else {
            constraintsChangeoversButton.innerText = "ON";
        }
        changeoversStateSwitch(constraintsChangeoversButton);

        const changeoversTimes = Array.from(constraintsChangeoversTimesWrapper.children);
        changeoversTimes.forEach((e, num) => {
            const inputChangeoversTimes = e.querySelectorAll("div:not(.titleColumn) > input");
            const size = Math.sqrt(inputChangeoversTimes.length);
            for (let i = 0; i < inputChangeoversTimes.length; i++) {
                const row = Math.floor(i / size);
                const column = i % size;
                inputChangeoversTimes[i].value = row !== column ? importedData.changeoversTimes[num][i] : 0;
            }
        });

        const inputChangeoversCosts = constraintsChangeoverCostsWrapper.querySelectorAll("input");
        for (let i = 0; i < inputChangeoversCosts.length; i++) {
            inputChangeoversCosts[i].value = importedData.changeoversCosts[i];
        }
    }

    function validateImportedData(data) {
        const isArray = Array.isArray;
        const isInt = (val) => Number.isInteger(Number(val));
        const isPositiveInt = (val) => isInt(val) && Number(val) > 0;
        const isInRange = (val, min, max) => isInt(val) && Number(val) >= min && Number(val) <= max;
        const isNonNegativeIntUnder1000 = (val) => isInt(val) && Number(val) >= 0 && Number(val) <= 1000;
        const isEfficiencyValue = (val) => {
            const num = Number(val);
            return !isNaN(num) && num > 0 && num <= 1 && Number(num.toFixed(2)) === num;
        };

        const check = (condition, message) => {
            if (!condition) throw new Error(message);
        };

        const nTypes = Number(data.numberOfMachineTypes);
        const nJobs = Number(data.numberOfJobs);
        const nOps = Number(data.numberOfOperations);
        const matrixSize = nJobs * nOps;

        // Liczba wszystkich maszyn:
        check(isArray(data.numberOfMachinesOfGivenType), "Brakuje tablicy 'numberOfMachinesOfGivenType'");
        const totalMachines = data.numberOfMachinesOfGivenType.reduce((sum, val) => sum + Number(val), 0);

        // --- SYSTEM PARAMETERS ---
        check(isInRange(nTypes, 1, 15), "'numberOfMachineTypes' musi być w zakresie 1–15");

        check(data.numberOfMachinesOfGivenType.length === nTypes,
            `Tablica 'numberOfMachinesOfGivenType' ma długość ${data.numberOfMachinesOfGivenType.length}, oczekiwano ${nTypes}`);
        data.numberOfMachinesOfGivenType.forEach((v, i) =>
            check(isInRange(v, 1, 15), `Wartość 'numberOfMachinesOfGivenType[${i}]' musi być całkowita z zakresu 1–15`));

        check(isArray(data.efficiencyCoefficient), "Brakuje tablicy 'efficiencyCoefficient'");
        check(data.efficiencyCoefficient.length === totalMachines,
            `Tablica 'efficiencyCoefficient' ma długość ${data.efficiencyCoefficient.length}, oczekiwano ${totalMachines}`);
        data.efficiencyCoefficient.forEach((v, i) =>
            check(isEfficiencyValue(v), `Wartość 'efficiencyCoefficient[${i}]' musi być w zakresie (0, 1] z dokładnością do 2 miejsc po przecinku`));

        // --- PROBLEM PARAMETERS ---
        check(isInRange(nJobs, 1, 15), "'numberOfJobs' musi być w zakresie 1–15");
        check(isInRange(nOps, 1, 15), "'numberOfOperations' musi być w zakresie 1–15");

        const allowedPriorityRules = ["FIFO", "LIFO", "SPT", "LPT", "EDD", "LWR"];
        check(typeof data.priorityRule === "string", "'priorityRule' musi być tekstem");
        check(allowedPriorityRules.includes(data.priorityRule),
            `'priorityRule' ma niedozwoloną wartość: ${data.priorityRule}. Dozwolone: ${allowedPriorityRules.join(", ")}`);

        check(isArray(data.jobsArrivalTime), "Brakuje tablicy 'jobsArrivalTime'");
        check(data.jobsArrivalTime.length === nJobs,
            `Tablica 'jobsArrivalTime' ma długość ${data.jobsArrivalTime.length}, oczekiwano ${nJobs}`);
        data.jobsArrivalTime.forEach((v, i) =>
            check(isNonNegativeIntUnder1000(v), `Wartość 'jobsArrivalTime[${i}]' musi być całkowita z zakresu 0–1000`));

        check(isArray(data.jobsCompletionTimes), "Brakuje tablicy 'jobsCompletionTimes'");
        check(data.jobsCompletionTimes.length === nJobs,
            `Tablica 'jobsCompletionTimes' ma długość ${data.jobsCompletionTimes.length}, oczekiwano ${nJobs}`);
        data.jobsCompletionTimes.forEach((v, i) =>
            check(isNonNegativeIntUnder1000(v), `Wartość 'jobsCompletionTimes[${i}]' musi być całkowita z zakresu 0–1000`));

        check(isArray(data.jobsProcessingTimes), "Brakuje tablicy 'jobsProcessingTimes'");
        check(data.jobsProcessingTimes.length === matrixSize,
            `Tablica 'jobsProcessingTimes' ma długość ${data.jobsProcessingTimes.length}, oczekiwano ${matrixSize} (czyli ${nJobs} × ${nOps})`);
        data.jobsProcessingTimes.forEach((v, i) =>
            check(isNonNegativeIntUnder1000(v), `Wartość 'jobsProcessingTimes[${i}]' musi być całkowita z zakresu 0–1000`));

        check(isArray(data.jobsRouting), "Brakuje tablicy 'jobsRouting'");
        check(data.jobsRouting.length === matrixSize,
            `Tablica 'jobsRouting' ma długość ${data.jobsRouting.length}, oczekiwano ${matrixSize} (czyli ${nJobs} × ${nOps})`);
        data.jobsRouting.forEach((v, i) =>
            check(isInt(v) && Number(v) >= 0 && Number(v) <= totalMachines,
                `Wartość 'jobsRouting[${i}]' musi być liczbą całkowitą od 0 (brak) do ${totalMachines} (liczba maszyn)`));

        // --- TRANSPORT ---
        check(["ON", "OFF"].includes(data.transportState), "'transportState' musi być ON albo OFF");

        const transportSize = totalMachines * totalMachines;
        check(isArray(data.transportTimes), "Brakuje tablicy 'transportTimes'");
        check(data.transportTimes.length === transportSize,
            `Tablica 'transportTimes' ma długość ${data.transportTimes.length}, oczekiwano ${transportSize} (czyli ${totalMachines} × ${totalMachines})`);
        data.transportTimes.forEach((v, i) =>
            check(isNonNegativeIntUnder1000(v), `Wartość 'transportTimes[${i}]' musi być całkowita z zakresu 0–1000`));

        // --- CHANGEOVERS ---
        check(["ON", "OFF"].includes(data.changeoversState), "'changeoversState' musi być ON albo OFF");

        check(isArray(data.changeoversTimes), "Brakuje tablicy 'changeoversTimes'");
        check(data.changeoversTimes.length === totalMachines,
            `Tablica 'changeoversTimes' ma ${data.changeoversTimes.length} warstw, oczekiwano ${totalMachines} (tyle, ile jest maszyn)`);

        const changeoverMatrixSize = nJobs * nJobs;
        data.changeoversTimes.forEach((layer, idx) => {
            check(isArray(layer), `Warstwa 'changeoversTimes[${idx}]' nie jest tablicą`);
            check(layer.length === changeoverMatrixSize,
                `Warstwa 'changeoversTimes[${idx}]' ma długość ${layer.length}, oczekiwano ${changeoverMatrixSize} (czyli ${nJobs} × ${nJobs})`);

            layer.forEach((v, i) => {
                const row = Math.floor(i / nJobs);
                const col = i % nJobs;
                if (row === col) {
                    check(Number(v) === 0,
                        `Przekątna 'changeoversTimes[${idx}][${i}]' (z zlecenia ${row + 1} na to samo) musi mieć wartość 0`);
                } else {
                    check(isNonNegativeIntUnder1000(v),
                        `Wartość 'changeoversTimes[${idx}][${i}]' (z zlecenia ${row + 1} na ${col + 1}) musi być całkowita z zakresu 0–1000`);
                }
            });
        });

        check(isArray(data.changeoversCosts), "Brakuje tablicy 'changeoversCosts'");
        check(data.changeoversCosts.length === nTypes,
            `Tablica 'changeoversCosts' ma długość ${data.changeoversCosts.length}, oczekiwano ${nTypes}`);
        data.changeoversCosts.forEach((v, i) =>
            check(isNonNegativeIntUnder1000(v), `Wartość 'changeoversCosts[${i}]' musi być całkowita z zakresu 0–1000`));
    }


    //! Export function
    function exportData() {
        let exportedData = {
            numberOfMachineTypes: 0,
            numberOfMachinesOfGivenType: [],
            efficiencyCoefficient: [],
            numberOfJobs: 0,
            numberOfOperations: 0,
            priorityRule: "FIFO",
            jobsArrivalTime: [],
            jobsCompletionTimes: [],
            jobsProcessingTimes: [],
            jobsRouting: [],
            changeoversState: "OFF",
            changeoversTimes: [],
            changeoversCosts: [],
            transportState: "OFF",
            transportTimes: []
        };

        //! System parameters
        exportedData.numberOfMachineTypes = systemParamsNumberOfMachineTypes.value;

        const inputNumberOfMachinesOfGivenType = systemParamsnumberOfMachinesOfGivenTypeWrapper.querySelectorAll("input");
        for (let i = 0; i < inputNumberOfMachinesOfGivenType.length; i++) {
            exportedData.numberOfMachinesOfGivenType.push(inputNumberOfMachinesOfGivenType[i].value);
        }

        const inputEfficiencyCoefficient = systemParamsEfficiencyCoefficientWrapper.querySelectorAll("input");
        for (let i = 0; i < inputEfficiencyCoefficient.length; i++) {
            exportedData.efficiencyCoefficient.push(inputEfficiencyCoefficient[i].value);
        }


        //! Problem parameters
        exportedData.numberOfJobs = problemParamsNumberOfJobs.value;
        exportedData.numberOfOperations = problemParamsMaxNumberOfOperations.value;
        exportedData.priorityRule = problemParamsPriorityRule.value;

        const inputArrival = problemParamsJobsArrivalTimesWrapper.querySelectorAll("input");
        for (let i = 0; i < inputArrival.length; i++) {
            exportedData.jobsArrivalTime.push(inputArrival[i].value);
        }

        const inputComplitionTimes = problemParamsRequiredJobsCompletionTimesWrapper.querySelectorAll("input");
        for (let i = 0; i < inputComplitionTimes.length; i++) {
            exportedData.jobsCompletionTimes.push(inputComplitionTimes[i].value);
        }

        const inputTimes = problemParamsProcessingTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputTimes.length; i++) {
            exportedData.jobsProcessingTimes.push(inputTimes[i].value);
        }

        const inputRouting = problemParamsJobsRoutingWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputRouting.length; i++) {
            exportedData.jobsRouting.push(inputRouting[i].value);
        }


        //! Constraints
        exportedData.transportState = constraintsTransportButton.innerText;

        const inputTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputTransportTimes.length; i++) {
            exportedData.transportTimes.push(inputTransportTimes[i].value);
        }


        exportedData.changeoversState = constraintsChangeoversButton.innerText;

        const changeoversTimes = Array.from(constraintsChangeoversTimesWrapper.children);
        changeoversTimes.forEach(e => {
            let tmpexportedData = [];
            const inputChangeoversTimes = e.querySelectorAll("div:not(.titleColumn) > input");

            for (let i = 0; i < inputChangeoversTimes.length; i++) {
                tmpexportedData.push(inputChangeoversTimes[i].value);
            }

            exportedData.changeoversTimes.push(tmpexportedData);
        });


        const inputChangeoversCosts = constraintsChangeoverCostsWrapper.querySelectorAll("input");
        for (let i = 0; i < inputChangeoversCosts.length; i++) {
            exportedData.changeoversCosts.push(inputChangeoversCosts[i].value);
        }

        exportTextarea.value = JSON.stringify(exportedData);
    }
};