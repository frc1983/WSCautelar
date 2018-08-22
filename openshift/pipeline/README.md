This directory contains a Jenkinsfile which can be used to build
nodejs-ex using an OpenShift build pipeline.

To do this, run:

```bash
# create the nodejs example as usual
oc new-app https://github.com/frc1983/WSCautelar

# now create the pipeline build controller from the openshift/pipeline
# subdirectory
oc new-app https://github.com/frc1983/WSCautelar \
  --context-dir=openshift/pipeline --name nodejs-ex-pipeline
```
