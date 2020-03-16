const { amazon } = require('./amazon')
const uuidv4 = require('uuid').v4
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
let runuuid

describe('Top-level Amazon', () => {
  describe('default Java package', () => {
    beforeEach(() => {
      runuuid = uuidv4()
      fs.mkdirSync(`/tmp/${runuuid}`)
      fs.mkdirSync(`/tmp/${runuuid}/src`)
      fs.mkdirSync(`/tmp/${runuuid}/src/main`)
      fs.mkdirSync(`/tmp/${runuuid}/src/main/java`)
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/Hello.java`, `
    public class Hello {
      public Response hello(Request inp) {
        String greetingString = String.format("Hello %s %s.", inp.firstName, inp.lastName);
        return new Response(greetingString);
      }
    }
    `)
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/Request.java`, ` 
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
    `)

      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/Response.java`, ` 
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
    `)
    })

    afterEach(() => {
    // it suffices to just forget runuuid, will be wiped anyway
      runuuid = null
    })

    test('produces buildable proj | without explicit Req/Res', () => {
      const mockCliArgs = {
        '--path': `/tmp/${runuuid}`,
        '--entry-file': `/tmp/${runuuid}/src/main/java/Hello.java`,
        '--entry-method': 'hello',
        '--name': 'cloudfname123'
      }

      amazon(mockCliArgs)

      const fn = jest.fn(() => execSync(`gradle build -b /tmp/${runuuid}/amazon/build.gradle`))
      fn()
      expect(fn).toHaveReturned()
    })

    test('produces buildable proj | with explicit Req/Res', () => {
      const mockCliArgs = {
        '--path': `/tmp/${runuuid}`,
        '--entry-file': `/tmp/${runuuid}/src/main/java/Hello.java`,
        '--request-file': `/tmp/${runuuid}/src/main/java/Req.java`,
        '--response-file': `/tmp/${runuuid}/src/main/java/Res.java`,
        '--entry-method': 'hello',
        '--name': 'cloudfname123'
      }

      // Rename Request.java => Req.java
      // Rename Response.java => Res.java for testing purposes
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/Req.java`,
        fs.readFileSync(`/tmp/${runuuid}/src/main/java/Request.java`, { encoding: 'utf8' })
          .replace(/Request/g, 'Req')
      )

      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/Res.java`,
        fs.readFileSync(`/tmp/${runuuid}/src/main/java/Response.java`, { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
      )
      // Rename usages of Request, Response
      const entryFname = mockCliArgs['--entry-file'].split(path.sep).slice(-1)[0]
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/${entryFname}`,
        fs.readFileSync(`/tmp/${runuuid}/src/main/java/${entryFname}`, { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
          .replace(/Request/g, 'Req')
      )

      // Remove moved files
      fs.unlinkSync(`/tmp/${runuuid}/src/main/java/Response.java`)
      fs.unlinkSync(`/tmp/${runuuid}/src/main/java/Request.java`)

      // See if it still works
      amazon(mockCliArgs)

      const fn = jest.fn(() => execSync(`gradle build -b /tmp/${runuuid}/amazon/build.gradle`))
      fn()
      expect(fn).toHaveReturned()
    })
  })
})

describe('Top-level Amazon', () => {
  describe('example Package', () => {
    beforeEach(() => {
      runuuid = uuidv4()
      fs.mkdirSync(`/tmp/${runuuid}`)
      fs.mkdirSync(`/tmp/${runuuid}/src`)
      fs.mkdirSync(`/tmp/${runuuid}/src/main`)
      fs.mkdirSync(`/tmp/${runuuid}/src/main/java`)
      fs.mkdirSync(`/tmp/${runuuid}/src/main/java/example`)
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/example/Hello.java`, `
    package example;
    public class Hello {
      public Response hello(Request inp) {
        String greetingString = String.format("Hello %s %s.", inp.firstName, inp.lastName);
        return new Response(greetingString);
      }
    }
    `)
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/example/Request.java`, `
  package example; 
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
    `)

      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/example/Response.java`, ` 
  package example;
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
    `)
    })

    afterEach(() => {
    // it suffices to just forget runuuid, will be wiped anyway
      runuuid = null
    })
    test('produces buildable proj | with explicit Req/Res | example package', () => {
      const mockCliArgs = {
        '--path': `/tmp/${runuuid}`,
        '--entry-file': `/tmp/${runuuid}/src/main/java/example/Hello.java`,
        '--request-file': `/tmp/${runuuid}/src/main/java/example/Req.java`,
        '--response-file': `/tmp/${runuuid}/src/main/java/example/Res.java`,
        '--entry-method': 'hello',
        '--name': 'cloudfname123'
      }

      // Rename Request.java => Req.java
      // Rename Response.java => Res.java for testing purposes
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/example/Req.java`,
        fs.readFileSync(`/tmp/${runuuid}/src/main/java/example/Request.java`, { encoding: 'utf8' })
          .replace(/Request/g, 'Req')
      )

      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/example/Res.java`,
        fs.readFileSync(`/tmp/${runuuid}/src/main/java/example/Response.java`, { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
      )
      // Rename usages of Request, Response
      const entryFname = mockCliArgs['--entry-file'].split(path.sep).slice(-1)[0]
      fs.writeFileSync(`/tmp/${runuuid}/src/main/java/example/${entryFname}`,
        fs.readFileSync(`/tmp/${runuuid}/src/main/java/example/${entryFname}`, { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
          .replace(/Request/g, 'Req')
      )

      // Remove moved files
      fs.unlinkSync(`/tmp/${runuuid}/src/main/java/example/Response.java`)
      fs.unlinkSync(`/tmp/${runuuid}/src/main/java/example/Request.java`)

      // See if it still works
      amazon(mockCliArgs)

      const fn = jest.fn(() => execSync(`gradle build -b /tmp/${runuuid}/amazon/build.gradle`))
      fn()
      expect(fn).toHaveReturned()
    })
  })
})
