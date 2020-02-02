# Introduction
  About State of the art
    - Timeline
    - Advantages
    Why FaaS
      Old tech's issues
      New tech's opportunities (time/cost/complexity)
    Why FaaS Workflows
      Limits of current FaaS

# Motivation 

  ### Problems
   Why custom EE's
    - Limits of current FaaS workflows
    - Opportunities

# Body

  ### Considerations
    - for old codebases
    - for new codebases
    ("How should a dev eventually interact with this hypothetical tool")
      - consider legacy compat, maintainablility of codebase, (...)
    - to be used both by devs (manually) and programs (EEs)

  ### Solution
    soak, modular *2faas toolchain

  ### [soak, js2faas, java2faas, bin2faas] -> {
    - what it solves and how
    - legacy usecases
    - new usecases
    - evaluation (experimental): time/cost
    - evaluation: maintainability/dev-friendliness
  }


  soak - enable larger in/outputs 
    - usecase: enable previously impossible
    - evaluate: measure at 6MB payloads, single-provider vs local machine fetch/stash of data
      - time: impact of S3 stashing vs impact of local machine fetch/stash on various N speeds
      - cost:  cost saved / spent vs local fetch/stash
  bin2faas - run binaries upon events
    - evaluate: 
      - cost, time, convenience vs local execution
  js2faas, java2faas 
    ....
  
  # Joint evaluation (wrt. to Enactment Engine use case)

  # Conclusion
  # Outlook
    - On-the-fly faasification??
1
  # Misc, Appendix