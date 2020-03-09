#!/bin/bash

##############################################
# Bash argument parser 
# Courtesy Rafael Muynarsk / Stackoverflow 
##############################################
helpFunction()
{
   echo ""
   echo "Usage: $0 -a parameterA -b parameterB -c parameterC"
   echo ""
   echo "a Description of what is parameterA"
   echo "b Description of what is parameterB"
   echo "c Description of what is parameterC"
   exit 1 # Exit script after printing help
}

while getopts "r:R:u:p:o:s:" opt
do
   case "$opt" in
      r ) parameterr="$OPTARG" ;;
      R ) parameterR="$OPTARG" ;;
      u ) parameteru="$OPTARG" ;;
      p ) parameterp="$OPTARG" ;;
      o ) parametero="$OPTARG" ;;
      s ) parameters="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$parameterr" ] || [ -z "$parameterR" ] || [ -z "$parameteru" ] || [ -z "$parameterp" ] || [ -z "$parametero" ] || [ -z "$parameters" ]
then
   echo "Some or all of the parameters are empty";
   helpFunction
fi

# Begin script in case all parameters are correct

# TODO take ibm org, space, resource group, uname, password

# echo "hope you specified --region, --uname, --password"
# if [ $# -ne 2 ]; then
#   echo "Specify the region flag: --region [eu|us]"
#   exit 1
# fi
# if [ "$1" != "--region" ]; then
#   echo "First argument should be '--region' but it's '$1'"
#   exit 1
# fi

#getopt -l "help,version:,verbose,rebuild,dryrun" -- "$@"
#getopt -l "region:,resourcegroup:" -- "r:R" "--region=Karthik -resourcegroup=22"
#getopt -l "region:,resourcegroup" -- "r:R:" "$@"
ibmcloud login -u "$parameteru" -p "$parameterp" -g "$parameterR"
ibmcloud target -r "$parameterr"
ibmcloud target -o "$parametero" -s "$parameters"
