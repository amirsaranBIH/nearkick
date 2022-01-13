import "./About.css";

function About() {
  return (
    <div className="about">
      <h1 className="h1">About</h1>
      <p>
        Nearkick is a decentralized application that allows you to create and
        kickstart your own projects. The goal is to create a platform that
        allows anyone to create and kickstart their own projects. The platform
        will be able to be used by anyone, and anyone can create and kickstart
        their own projects.
      </p>
      <p>
        When supporters of a project reach the goal, the project will be marked
        as completed. All the supporters will be added to a list of supporters
        of the project. Later they can verify that they are a supporter of the
        project. If the project is not funded by the marked deadline, the
        supporters will be refunded the amount they have contributed. The
        project will be closed and the supporters will be notified.
      </p>
      <div className="faq">
        <h2 className="h2">Frequently Asked Questions</h2>
        <div>
          <details>
            <summary>What is Nearkick?</summary>
            <p>
              Nearkick is a decentralized application that allows you to create
              and kickstart your own projects.
            </p>
          </details>
          <details>
            <summary>How does it work?</summary>
            <p>
              Nearkick uses a blockchain to store all the information about the
              project. The data is decentralized and can be accessed by anyone.
              The project can be created and funded by anyone and anyone can
              kickstart the project.
            </p>
          </details>
          <details>
            <summary>
              How can I get my rewards after a project is funded?
            </summary>
            <p>
              The project will be marked as completed. All the supporters will
              be added to a list of supporters of the project. Later they can
              verify that they are a supporter of the project. If the project is
              not funded by the marked deadline, the supporters will be refunded
              the amount they have contributed. The project will be closed and
              the supporters will be notified.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

export default About;
