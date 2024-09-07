//! Main app
window.onload = () => {

    //! Global variables
    const navigationItems = document.querySelectorAll("nav div");
    const viewItems = document.querySelectorAll("main section");
    const systemParams = document.querySelector("#systemParams");
    const problemParams = document.querySelector("#problemParams");
    const constraints = document.querySelector("#constraints");
    const solution = document.querySelector("#solution");
    const qualityIndicators = document.querySelector("#qualityIndicators");

    const systemParamsNumberOfMachineTypes = document.querySelector("#systemParams_numberOfMachineTypes input");
    const systemParamsnumberOfMachinesOfGivenTypeWrapper = document.querySelector("#systemParams_numberOfMachinesOfGivenType");
    const systemParamsefficiencyCoefficientWrapper = document.querySelector("#systemParams_efficiencyCoefficient");

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

    let numberOfMachineTypes = 1;
    let numberOfMachinesOfGivenType = [];
    let numberOfJobs = 1;
    let numberOfOperations = 1;
    const currentDate = new Date;


    //! Copyright year update
    document.querySelector("#copyrightYear").innerText = currentDate.getFullYear();


    //! Navigation handler
    navigationItems.forEach((e, i) => {
        e.addEventListener("click", () => {
            window.scrollTo(0, 0);

            document.querySelector("nav div.active").classList.remove("active");
            e.classList.add("active");

            let oldActive = document.querySelector("section.active");
            oldActive.classList.add('fade-out');

            oldActive.addEventListener('transitionend', function handleTransitionEnd() {
                oldActive.classList.remove('active', 'fade-out');

                viewItems[i].classList.add('active');
                oldActive.removeEventListener('transitionend', handleTransitionEnd); // Wyczyść listener
            }, {
                once: true
            });
        })
    });


    //* System parameters view -------------------------------------------------------------------------------------

    //! Number of machine types handler
    systemParamsNumberOfMachineTypes.addEventListener("change", (e) => {

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

        updateChangeoversTimes(numberOfJobs, numberOfMachineTypes);
        updateTransportTimesBetweenMachines(numberOfJobs, numberOfMachineTypes);
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
            input.addEventListener("change", () => {

                //! Input validation
                let value = parseInt(input.value);
                if (value < 1 || input.value == "") {
                    input.value = 1;
                } else if (value > 15) {
                    input.value = 15;
                }

                value = parseInt(value);
                input.value = value;

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

            const children = Array.from(systemParamsefficiencyCoefficientWrapper.children);
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
                    input.addEventListener('change', (e) => {
                        const value = parseFloat(input.value);
                        if (value < 0.01) {
                            input.value = 0.01;
                        } else if (value > 1) {
                            input.value = 1;
                        }
                    });

                    fieldDiv.appendChild(innerDiv);
                }

                systemParamsefficiencyCoefficientWrapper.appendChild(fieldDiv);
            }
        } else {
            numberOfMachinesOfGivenType[selectedIndex] = number;

            const fields = Array.from(systemParamsefficiencyCoefficientWrapper.querySelectorAll('.field.stacked'));
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


    //* Problem parameters view -------------------------------------------------------------------------------------

    //! Number of jobs handler
    problemParamsNumberOfJobs.addEventListener("change", (e) => {

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

        updateChangeoversTimes(numberOfJobs, numberOfMachineTypes);
        updateChangeoversCost(numberOfJobs);
        updateTransportTimesBetweenMachines(numberOfJobs, numberOfMachineTypes);
    });

    //! Max. number of operations handler
    problemParamsMaxNumberOfOperations.addEventListener("change", (e) => {

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
            input.value = 1;
            input.addEventListener("change", () => {

                //! Input validation
                let value = parseInt(input.value);
                if (value < 1 || input.value == "") {
                    input.value = 1;
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
            input.addEventListener("change", () => {

                //! Input validation
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
                input.addEventListener("change", () => {
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

                fieldDiv.appendChild(input);
            }

            problemParamsProcessingTimesWrapper.appendChild(fieldDiv);
        }
    }

    //! Jobs routing update handler
    function updateJobsRouting(jobs, operations) {

        const children = Array.from(problemParamsJobsRoutingWrapper.children);
        children.forEach(child => child.remove());

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
                input.addEventListener("change", () => {
                    let value = parseInt(input.value);
                    if (value < 1 || input.value == "") {
                        value = 1;
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


    //* Constraints view -------------------------------------------------------------------------------------

    //! Changeovers switch handler
    constraintsChangeoversButton.addEventListener("click", (e) => {
        changeoversStateSwitch(constraintsChangeoversButton);
    });

    function changeoversStateSwitch(e) {
        let constraintsChangeoversTimes = constraintsChangeoversTimesWrapper.querySelectorAll("input");
        let constraintsChangeoverCosts = constraintsChangeoverCostsWrapper.querySelectorAll("input");

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
    function updateChangeoversTimes(jobs, machines) {

        const children = Array.from(constraintsChangeoversTimesWrapper.children);
        children.forEach(child => child.remove());

        for (let i = 0; i < machines; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `M${i+1}`;
            fieldDiv.appendChild(p);

            for (let j = 0; j < jobs; j++) {
                const input = document.createElement('input');
                input.type = 'number';

                //! Input validation
                input.addEventListener("change", () => {
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
            p.textContent = `J${i+1}`;

            const input = document.createElement('input');
            input.type = 'number';

            //! Input validation
            input.addEventListener("change", () => {
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

            constraintsChangeoverCostsWrapper.appendChild(fieldDiv);
        }
    }


    //! Transport switch handler
    constraintsTransportButton.addEventListener("click", (e) => {
        transportStateSwitch(constraintsTransportButton);
    });

    function transportStateSwitch(e) {
        let constraintsTransportTimes = constraintsTransportTimesWrapper.querySelectorAll("input");

        if (e.innerText == "ON") {
            e.innerText = "OFF";
            constraintsTransportResources.forEach(e => {
                e.disabled = true;
            });
            constraintsTransportTimes.forEach(e => {
                e.disabled = true;
            });
        } else {
            e.innerText = "ON";
            constraintsTransportResources.forEach(e => {
                e.disabled = false;
            });
            constraintsTransportTimes.forEach(e => {
                e.disabled = false;
            });
        }
    }

    //! Number of transport resources handler
    constraintsTransportResources.addEventListener("change", (e) => {

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
    function updateTransportTimesBetweenMachines(jobs, machines) {

        const children = Array.from(constraintsTransportTimesWrapper.children);
        children.forEach(child => child.remove());

        for (let i = 0; i < machines; i++) {
            const fieldDiv = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = `M${i+1}`;
            fieldDiv.appendChild(p);

            for (let j = 0; j < jobs; j++) {
                const input = document.createElement('input');
                input.type = 'number';

                //! Input validation
                input.addEventListener("change", () => {
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


                fieldDiv.appendChild(input);
            }

            constraintsTransportTimesWrapper.appendChild(fieldDiv);
        }
    }

};