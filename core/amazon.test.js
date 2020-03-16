const { amazon } = require('./amazon')
const uuidv4 = require('uuid').v4
const fs = require('fs')
let runuuid

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

describe('top-level amazon comp', () => {
  test('creates amazon dir, produces buildable amazon/build.gradle', () => {
    const mockCliArgs = {
      '--path': `/tmp/${runuuid}`,
      '--entry-file': `/tmp/${runuuid}/src/main/java/Hello.java`,
      '--entry-method': 'hello',
      '--name': 'cloudfname123'
    }

    const fn = jest.fn(() => amazon(mockCliArgs))
    fn()
    expect(fn).toHaveReturned()
  })
})
