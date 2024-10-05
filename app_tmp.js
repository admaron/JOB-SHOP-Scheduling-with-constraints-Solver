//! Main app
window.onload = () => {

    //* GLOBAL VARIABLES -------------------------------------------------------------------------------------
    const navigationItems = document.querySelectorAll("nav div");
    const viewItems = document.querySelectorAll("main section");
    const systemParams = document.querySelector("#systemParams");
    const problemParams = document.querySelector("#problemParams");
    const constraints = document.querySelector("#constraints");
    const solution = document.querySelector("#solution");
    const qualityIndicators = document.querySelector("#qualityIndicators");
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

    const constraintsChangeovers = document.querySelector("#constraints_ChangeoversWrapper div");
    const constraintsChangeoversButton = document.querySelector("#constraints_Changeovers div");
    const constraintsChangeoversTimesWrapper = document.querySelector("#constraints_ChangeoverTimes");
    const constraintsChangeoverCostsWrapper = document.querySelector("#constraints_ChangeoverCosts");

    const constraintsTransport = document.querySelector("#constraints_TransportWrapper div");
    const constraintsTransportButton = document.querySelector("#constraints_Transport div");
    const constraintsTransportResources = document.querySelector("#constraints_TransportResources input");
    const constraintsTransportTimesWrapper = document.querySelector("#constraints_TransportTimes");

    let machines = [];
    let jobs = [];
    let changeovers = [];
    let transports = [];
    let ganttChart;

    let numberOfMachineTypes = 1;
    let numberOfMachinesOfGivenType = [];
    let numberOfJobs = 1;
    let numberOfOperations = 1;

    let solutionToUpdate = true;
    let navView = 1;
    const currentDate = new Date;


    //* BASICS -------------------------------------------------------------------------------------
    //! Copyright year update
    document.querySelector("#copyrightYear").innerText = currentDate.getFullYear();


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

            navigationItems[navView - 1].classList.add("active");

            let oldActive = document.querySelector("section.active");
            oldActive.classList.add('fade-out');

            oldActive.addEventListener('transitionend', function handleTransitionEnd() {
                oldActive.classList.remove('active', 'fade-out');

                viewItems[navView].classList.add('active');
                oldActive.removeEventListener('transitionend', handleTransitionEnd);
            }, {
                once: true
            });
        })
    });


    //! Input characters restriction handler
    const numberInputs = document.querySelectorAll('input[type="number"]');
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
        changeoversTimes: [0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 5, 0],
        changeoversCosts: [5, 5, 7, 2, 1],
        transportState: "ON",
        transportResources: 3,
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

        if (parseInt(number) >= "15") {
            number = 15;
            e.target.value = number;
        }

        number = parseInt(number);
        e.target.value = number;


        //! Triggers
        numberOfMachineTypes = number;
        updateNumberOfMachinesOfGivenType(numberOfMachineTypes);

        updateChangeoversCost(numberOfMachineTypes);
        updateTransportTimesBetweenMachines(numberOfMachineTypes);
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

                    const p = document.createElement('p');
                    p.textContent = `M${i+1}.${j+1}`;

                    innerDiv.appendChild(input);
                    innerDiv.appendChild(p);

                    //! Input validation
                    allowOnlyPositiveDecimals(input);

                    input.addEventListener('change', (e) => {
                        solutionToUpdate = true;

                        const value = parseFloat(input.value);
                        if (value < 0.01) {
                            input.value = 0.01;
                        } else if (value > 1) {
                            input.value = 1;
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

        if (parseInt(number) >= "15") {
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
        updateTransportTimesBetweenMachines(numberOfMachineTypes);
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

        if (parseInt(number) >= "15") {
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
                if (value < 10 || input.value == "") {
                    input.value = 0;
                } else if (value > 1000) {
                    input.value = 1000;
                }

                value = parseInt(value);
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
                if (value < 1 || input.value == "") {
                    value = 1;
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
        constraintsChangeoversTimesWrapper.appendChild(fieldDiv);

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

            constraintsChangeoversTimesWrapper.appendChild(fieldDiv);
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


    //! Transport switch handler
    constraintsTransportButton.addEventListener("click", (e) => {
        transportStateSwitch(constraintsTransportButton);
    });

    function transportStateSwitch(e) {
        solutionToUpdate = true;

        let constraintsTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("input:not(.disabled)");

        if (e.innerText == "ON") {
            e.innerText = "OFF";
            constraintsTransportResources.disabled = true;
            constraintsTransportTimes.forEach(e => {
                e.disabled = true;
            });
        } else {
            e.innerText = "ON";
            constraintsTransportResources.disabled = false;
            constraintsTransportTimes.forEach(e => {
                e.disabled = false;
            });
        }
    }

    //! Number of transport resources handler
    constraintsTransportResources.addEventListener("change", (e) => {
        solutionToUpdate = true;

        //! Input validation
        let number = e.target.value;
        if (number <= 0 || "") {
            number = 1;
            e.target.value = number;
        }

        if (parseInt(number) >= "15") {
            number = 15;
            e.target.value = number;
        }

        number = parseInt(number);
        e.target.value = number;
    });

    //! Transport times between machines update handler
    function updateTransportTimesBetweenMachines(machines) {
        const children = Array.from(constraintsTransportTimesWrapper.children);
        children.forEach(child => child.remove());

        //! Vertical label column
        const fieldDiv = document.createElement('div');
        fieldDiv.className = "titleColumn";

        const p = document.createElement('p');
        p.textContent = `.`;
        fieldDiv.appendChild(p);

        for (let j = 0; j < machines; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = `M${j+1}`;
            input.disabled = true;
            fieldDiv.appendChild(input);
        }
        constraintsTransportTimesWrapper.appendChild(fieldDiv);

        //! Dynamic content columns
        for (let i = 0; i < machines; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `M${i+1}`;
            fieldDiv.appendChild(p);

            for (let j = 0; j < machines; j++) {
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

            constraintsTransportTimesWrapper.appendChild(fieldDiv);
        }
    }


    //* SOLUTION VIEW -------------------------------------------------------------------------------------

    //! Solution calculation handler
    function generateSolution() {
        solutionToUpdate = false;

        machines = [];
        jobs = [];

        generateMachines();
        generateJobs();
        generateChangeovers();
        generateTransports();

        //! Infinite loop prevention bound
        let safetyBound = (jobs.reduce((total, obj) => {
            const operationsSum = obj.operationsTimes.reduce((sum, time) => sum + time, 0);
            return total + operationsSum;
        }, 0)) * 2;

        let currenTimeQueue = Array.from({
            length: numberOfMachineTypes
        }, () => []);
        let waitingQueue = Array.from({
            length: numberOfMachineTypes
        }, () => []);

        for (let i = 0; i < safetyBound; i++) {

            //! Check if any job arrived
            let jobsNotArrived = numberOfJobs;
            if (jobsNotArrived > 0) {
                const arrivedJobs = jobs.filter(obj => obj.arrival === i).map(obj => obj);

                if (arrivedJobs.length >= 1) {
                    jobsNotArrived -= arrivedJobs.length;
                    arrivedJobs.forEach(j => {
                        if ((j.routing[j.operation] - 1) >= 0) {
                            waitingQueue[(j.routing[j.operation] - 1)].push(j);
                        }
                    });
                }
            }

            //! Check if any machine is avaiable
            for (let m = 0; m < numberOfMachineTypes; m++) {
                if (waitingQueue[m].length > 0) {
                    const matchingMachines = machines.filter(machine => machine.type === (m + 1));
                    const selectedMachines = matchingMachines.filter(machine => machine.availability <= i);

                    if (selectedMachines.length == 1) {
                        assignJob(solveConflict(waitingQueue[m]), selectedMachines[0], i);
                    } else if (selectedMachines.length > 1) {
                        console.log("wiecej");
                    }
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
            }


            //! FIFO rule conflict solution handler
            function solveFIFO(jobs) {
                return jobs[0];
            }

            //! LIFO rule conflict solution handler
            function solveLIFO(jobs) {
                return jobs[jobs.length - 1];
            }
        }

        function assignJob(job, machine, timestamp) {
            if (machine.lineup.length == 0 && job.operation == 0) {
                assignJobToMachine(job, machine, timestamp);
            } else {
                if (transports.state == "OFF") {
                    if (changeovers.state == "OFF") {
                        assignJobToMachine(job, machine, timestamp);
                    }
                }

            }

            function assignJobToMachine(job, machine, timestamp) {
                let lineupEntry = {
                    x: [timestamp, timestamp + job.operationsTimes[job.operation]],
                    y: "M" + machine.ID
                }
                machine.lineup.push(lineupEntry);
                machine.lineupLabels.push(job.ID + "." + (job.operation + 1));
                machine.availability = timestamp + job.operationsTimes[job.operation];

                job.operation++;
            }

        }

        generateGanttChart();
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
                lineupLabels: []
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
                availability: 0
            };
        }
    }


    //! Changeovers object creation function
    function generateChangeovers() {
        let state = constraintsChangeoversButton.innerText == "OFF" ? 0 : 1;

        let times = [];
        let timeColumns = constraintsChangeoversTimesWrapper.querySelectorAll("div:not(.titleColumn)");
        for (let i = 0; i < numberOfJobs; i++) {
            let row = [];

            for (let j = 0; j < numberOfJobs; j++) {
                row.push(parseInt(timeColumns[j].querySelector(`input:nth-of-type(${i+1})`).value));
            }

            times.push(row);
        }

        let costs = [];
        constraintsChangeoverCostsWrapper.querySelectorAll("input").forEach(e => {
            costs.push(parseInt(e.value));
        });

        changeovers = createChangeoverObject(state, times, costs)

        function createChangeoverObject(state, times, cost) {
            return {
                state: state,
                times: times,
                cost: cost
            };
        }
    }


    //! Transport object creation function
    function generateTransports() {
        let state = constraintsTransportButton.innerText == "OFF" ? 0 : 1;

        let costs = [];
        let costsColumns = constraintsTransportTimesWrapper.querySelectorAll("div:not(.titleColumn)");
        for (let i = 0; i < numberOfMachineTypes; i++) {
            let row = [];

            for (let j = 0; j < numberOfMachineTypes; j++) {
                row.push(parseInt(costsColumns[j].querySelector(`input:nth-of-type(${i+1})`).value));
            }

            costs.push(row);
        }

        transports = createTransportObject(state, parseInt(constraintsTransportResources.value), costs);

        function createTransportObject(state, resources, times) {
            return {
                state: state,
                resources: resources,
                times: times
            };
        }
    }

    //! Gantt chart creation function
    function generateGanttChart() {
        let labels = [];
        machines.forEach(e => {
            labels.push("M" + e.ID);
        });

        const datasetLabels = [];

        const data = {
            labels: labels,
            datasets: []
        };

        // config 
        const config = {
            type: 'bar',
            data,
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        grid: {
                            display: false
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
                }
            },
            plugins: [ChartDataLabels]
        };

        // render init block
        if (ganttChart) {
            ganttChart.destroy();
        }
        ganttChart = new Chart(
            document.querySelector('#solution_GanttChart'),
            config
        );

        machines.forEach(e => {
            addData(ganttChart, e.lineupLabels, e.lineup, randomColorGenerator());
        });

        function addData(chart, label, data, color) {
            const newData = {
                label: label,
                data: data,
                backgroundColor: color
            }

            datasetLabels.push(label);

            chart.data.datasets.push(newData);
            chart.update();
        }

        function randomColorGenerator() {
            const getRandomLightValue = () => Math.floor(Math.random() * 128) + 128; // Losowe wartości od 128 do 255
            const r = getRandomLightValue(); // Losowy kolor czerwony
            const g = getRandomLightValue(); // Losowy kolor zielony
            const b = getRandomLightValue(); // Losowy kolor niebieski

            const randomColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

            return randomColor;
        }
    }


    //* IMPORT / EXPORT -------------------------------------------------------------------------------------
    importData(JSON.stringify(initialData)); //! Initial data load

    //! Import button handler
    importBTN.addEventListener("click", () => {
        importData(importTextarea.value);
        navigationItems[0].click();
    });


    //! Export button handler
    exportBTN.addEventListener("click", () => {
        exportData();
    });


    //! Import function
    function importData(data) {
        const event = new Event("change");
        const importedData = JSON.parse(data);

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
        if (importedData.changeoversState == "ON") {
            constraintsChangeoversButton.innerText = "OFF";
        } else {
            constraintsChangeoversButton.innerText = "ON";
        }
        changeoversStateSwitch(constraintsChangeoversButton);

        const inputChangeoversTimes = constraintsChangeoversTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputChangeoversTimes.length; i++) {
            inputChangeoversTimes[i].value = importedData.changeoversTimes[i];
        }

        const inputChangeoversCosts = constraintsChangeoverCostsWrapper.querySelectorAll("input");
        for (let i = 0; i < inputChangeoversCosts.length; i++) {
            inputChangeoversCosts[i].value = importedData.changeoversCosts[i];
        }


        if (importedData.transportState == "ON") {
            constraintsTransportButton.innerText = "OFF";
        } else {
            constraintsTransportButton.innerText = "ON";
        }
        transportStateSwitch(constraintsTransportButton);

        constraintsTransportResources.value = importedData.transportResources;

        const inputTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputTransportTimes.length; i++) {
            inputTransportTimes[i].value = importedData.transportTimes[i];
        }
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
            transportResources: 0,
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
        exportedData.changeoversState = constraintsChangeoversButton.innerText;

        const inputChangeoversTimes = constraintsChangeoversTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputChangeoversTimes.length; i++) {
            exportedData.changeoversTimes.push(inputChangeoversTimes[i].value);
        }

        const inputChangeoversCosts = constraintsChangeoverCostsWrapper.querySelectorAll("input");
        for (let i = 0; i < inputChangeoversCosts.length; i++) {
            exportedData.changeoversCosts.push(inputChangeoversCosts[i].value);
        }


        exportedData.transportState = constraintsTransportButton.innerText;
        exportedData.transportResources = constraintsTransportResources.value;

        const inputTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("div:not(.titleColumn) > input");
        for (let i = 0; i < inputTransportTimes.length; i++) {
            exportedData.transportTimes.push(inputTransportTimes[i].value);
        }

        exportTextarea.value = JSON.stringify(exportedData);
    }
};