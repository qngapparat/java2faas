IGNORENEXT=false
SNIPPED=""
for var in "$@"; do
    # Ignore known bad arguments
    if [ "$var" = '-i' ]
    then
      IGNORENEXT=true
      continue
    fi

    if [ "$IGNORENEXT" = true ]
    then 
      IGNORENEXT=false
      continue
    fi

    SNIPPED="$SNIPPED $var"
done

echo "$SNIPPED"