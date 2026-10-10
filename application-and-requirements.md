## Application and Requirements

In this project, we will design a Distributed Job Scheduler application.  The application will serve the following functional and non-functional requirements.

### Functional Requirements
- Users can submit jobs for execution either immediately, at a future time or on a recurring schedule
- Users can monitor the status of their jobs

Out of scope:
- Canceling or rescheduling jobs
- User management


### Nonfunctional Requirements
- Jobs should trigger within 2 seconds of execution start time
- System should be scalable to support up to 10k jobs per second
- System should execute jobs exactly once
- System should have watertight security
- System should be fully observable

### Core Entities
- Users
- Job
- Run (an instance of a job)