# java2faas

Transpiler to run your Java code on both Amazon & IBM FaaS

[GitHub](https://github.com/qngapparat/java2faas)

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
    --entry-file FPATH 
    --entry-method MNAME 
    --aws-role AWSROLEARN
    [--request-file FPATH] 
    [--response-file FPATH]
```

* `--path` is the path to the root of your Java project. 
* `--name` (alphanumeric) is the name your FaaS function will have in your AWS / IBM console.
* `--entry-file` should point to the Java file containing your Entry method.
* `--entry-method` The method name you want to run inside `--entry-file`.
* `--aws-role` The ARN of the Amazon IAM role your Lambda should have

**Optional**

These can be ommitted if you name the files accordingly, and place them with `--entry-file`.

* `--request-file` (defaults to `Request.java`) should point to the class that describes your Input payload. 
* `--response-file` (defaults to `Response.java`) should point to the class that describes your Output payload.

---

`java2faas` will transpile your Java code, and put it into the newly created directories `amazon` and `ibm`, respectively.

Dependencies with Maven (`pom.xml`) are supported and automatically included.

## Deploy your code

### To Amazon Lambda

```shell
cd amazon
sh deploy.sh # afterwards, `sh update.sh`

```

### To IBM Functions

```shell
cd ibm
sh deploy.sh # afterwards, `sh update.sh`
```

## Tips

* Maven is supported. You can specify something inside `pom.xml` (Dependencies...) and use it in your function.
* The functions will run on Java 8, on both Amazon and IBMs


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
    --aws-role xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Note: If you don't name your files `Request.java` and `Response.java`, just specify `--request-file FPATH` and/or `--response-file FPATH` instead.

```
├── amazon
│   ├── pom.xml
│   ├── deploy.sh
│   ├── update.sh
│   └── src/main/java 
├── ibm
│   ├── pom.xml
│   ├── deploy.sh
│   ├── update.sh
│   └── src/main/java 
└── src
    └── main
        └── java

```

**Deploy the function**

Note: Make sure you are logged into the respective Provider CLI tool when you deploy (`aws`, `ibmcloud`)

```
cd amazon
sh deploy.sh 
# --

cd ibm
sh deploy.sh
```


## Licence

MIT
