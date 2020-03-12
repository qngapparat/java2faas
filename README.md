# java2faas

Transpiler to run your Java code on both Amazon & IBM FaaS

## Install
```shell
npm i java2faas -g
```

## Basic Usage

```shell
$ java2faas OPTIONS... 
  
  Options
    --path YOURAPPDIR 
    --name FUNCTIONNAME 
    --entry-file FNAME 
    --entry-method MNAME # Name of method inside entry-file
    --request-file FNAME # Java file describing function input
    --response-file FNAME # Java file describing function output
```

`java2faas` will transpile your Java code, and put it into the newly created directories `amazon` and `ibm`, respectively.

## Deploy your code

### To Amazon Lambda

```shell
cd amazon
sh deploy.sh --region eu2 # afterwards, `sh update.sh`

// TODO not hardbaking secrets / login credentials
```

### To IBM Functions

```shell
cd ibm
sh deploy.sh # afterwards, `sh update.sh`
```


## Example

```
.
└── src
    └── main
        └── java
            ├── Hello.java
            ├── Request.java 
            └── Response.java 
```

**Hello.java**

A class containing the entry point of the cloud function

```java
// Class and method can have any name. Just specify it when running java2faas
public class Hello {
  public Response hello(Request inp) { 
    String greetingString = String.format("Hello %s %s.", inp.firstName, inp.lastName);
    return new Response(greetingString);
  }
}
```

**Request.java**

How the input to your cloud function will look. Make sure to include getters and setters.

```java
public class Request {
  String firstName;
  String lastName;

  public String getFirstName() {
      return firstName;
  }

  public void setFirstName(String firstName) {
      this.firstName = firstName;
  }

  public String getLastName() {
      return lastName;
  }

  public void setLastName(String lastName) {
      this.lastName = lastName;
  }

  public Request(String firstName, String lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
  }

  public Request() {
  }
}
```

**Response.java**

How the output will look. Make sure to include getters and setters.

```java
public class Response {
  String greetings;

  public String getGreetings() {
      return greetings;
  }

  public void setGreetings(String greetings) {
      this.greetings = greetings;
  }

  public Response(String greetings) {
      this.greetings = greetings;
  }

  public Response() {
  }
}
```


**Run `java2faas`**

```shell
java2faas
    --path . 
    --name myFirstFn 
    --entry-file src/main/java/Hello.java 
    --entry-method hello
    --request-file src/main/java/Request.java
    --response-file src/main/java/Response.java
```

```
├── amazon
│   ├── build.gradle
│   ├── deploy.sh
│   ├── update.sh
│   └── src/main/java
├── ibm
│   ├── build.gradle
│   ├── deploy.sh
│   ├── update.sh
│   └── src/main/java
└── src
    └── main
        └── java

```

**Deploy the function**

```
cd amazon
sh deploy.sh
# --

cd ibm
sh deploy.sh
```

## Misc

* Only Gradle is supported as build system
* You can use dependencies just like before. Make sure you name it `build.gradle`.
* Java 8 is used // TODO use latest per platform
## Licence

MIT
