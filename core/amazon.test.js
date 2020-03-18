const { amazon } = require('./amazon')
const uuidv4 = require('uuid').v4
const path = require('path')
const fs = require('fs')
const os = require('os')
const { execSync } = require('child_process')
let runuuid

describe('Top-level Amazon', () => {
  describe('default Java package', () => {
    beforeEach(() => {
      runuuid = uuidv4()
      fs.mkdirSync(path.join(os.tmpdir(), runuuid))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src'))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src', 'main'))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java'))
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Hello.java'), `
    public class Hello {
      public Response hello(Request inp) {
        String greetingString = String.format("Hello %s %s.", inp.firstName, inp.lastName);
        return new Response(greetingString);
      }
    }
    `)
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Request.java'), ` 
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

      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Response.java'), ` 
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
        '--path': path.join(os.tmpdir(), runuuid),
        '--entry-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Hello.java'),
        '--entry-method': 'hello',
        '--name': 'cloudfname123'
      }

      amazon(mockCliArgs)

      path.join(os.tmpdir(), runuuid, 'amazon', 'build.gradle')

      const fn = jest.fn(() => execSync(`gradle build -b ${path.join(os.tmpdir(), runuuid, 'amazon', 'build.gradle')}`))
      fn()
      expect(fn).toHaveReturned()
    })

    test('produces buildable proj | with explicit Req/Res', () => {
      const mockCliArgs = {
        '--path': path.join(os.tmpdir(), runuuid),
        '--entry-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Hello.java'),
        '--request-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Req.java'),
        '--response-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Res.java'),
        '--entry-method': 'hello',
        '--name': 'cloudfname123'
      }

      // Rename Request.java => Req.java
      // Rename Response.java => Res.java for testing purposes
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Req.java'),
        fs.readFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Request.java'), { encoding: 'utf8' })
          .replace(/Request/g, 'Req')
      )

      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Res.java'),
        fs.readFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Response.java'), { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
      )
      // Rename usages of Request, Response
      const entryFname = mockCliArgs['--entry-file'].split(path.sep).slice(-1)[0]
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', entryFname),
        fs.readFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', entryFname), { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
          .replace(/Request/g, 'Req')
      )

      // Remove moved files
      fs.unlinkSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Request.java'))
      fs.unlinkSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'Response.java'))

      // See if it still works
      amazon(mockCliArgs)
      const fn = jest.fn(() => execSync(`gradle build -b ${path.join(os.tmpdir(), runuuid, 'amazon', 'build.gradle')}`))
      fn()
      expect(fn).toHaveReturned()
    })
  })
})

describe('Top-level Amazon', () => {
  describe('example Package', () => {
    beforeEach(() => {
      runuuid = uuidv4()
      fs.mkdirSync(path.join(os.tmpdir(), runuuid))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src'))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src', 'main'))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java'))
      fs.mkdirSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example'))
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Hello.java'), `
    package example;
    public class Hello {
      public Response hello(Request inp) {
        String greetingString = String.format("Hello %s %s.", inp.firstName, inp.lastName);
        return new Response(greetingString);
      }
    }
    `)
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Request.java'), `
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

      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Response.java'), ` 
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
        '--path': path.join(os.tmpdir(), runuuid),
        '--entry-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Hello.java'),
        '--request-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Req.java'),
        '--response-file': path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Res.java'),
        '--entry-method': 'hello',
        '--name': 'cloudfname123'
      }

      // Rename Request.java => Req.java
      // Rename Response.java => Res.java for testing purposes
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Req.java'),
        fs.readFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Request.java'), { encoding: 'utf8' })
          .replace(/Request/g, 'Req')
      )

      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Res.java'),
        fs.readFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Response.java'), { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
      )
      // Rename usages of Request, Response
      const entryFname = mockCliArgs['--entry-file'].split(path.sep).slice(-1)[0]
      fs.writeFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', entryFname),
        fs.readFileSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', entryFname), { encoding: 'utf8' })
          .replace(/Response/g, 'Res')
          .replace(/Request/g, 'Req')
      )

      // Remove moved files
      fs.unlinkSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Response.java'))
      fs.unlinkSync(path.join(os.tmpdir(), runuuid, 'src', 'main', 'java', 'example', 'Request.java'))

      // See if it still works
      amazon(mockCliArgs)

      const fn = jest.fn(() => execSync(`gradle build -b ${path.join(os.tmpdir(), runuuid, 'amazon', 'build.gradle')}`))
      fn()
      expect(fn).toHaveReturned()
    })
  })
})
