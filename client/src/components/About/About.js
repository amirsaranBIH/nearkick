import "./About.css";

function About() {
  return (
    <div className="about">
      <h1 className="h1">About Nearkick</h1>
      <p>
        Nearkick is a decentralized application that allows you to create and
        kickstart your own projects. The goal is to create a platform that
        allows anyone to create and kickstart their own projects and anyone to
        fund them.
      </p>
      <p>
        When supporters of a project reach the goal, the project will be marked
        as completed. All the supporters will be added to a list of supporters
        of the project. Later they can verify that they are a supporter of the
        project. If the project is not funded by the marked deadline, the
        supporters will be refunded the amount they have contributed. The
        project will be closed and the supporters will be notified.
      </p>
      <p>
        Nearkick is a loosely-knit community ecosystem which seeks to replace
        the systems which are currently in place. We provide a decentralized
        platform to create and fund their own projects. The goal of Nearkick is
        to create a platform that allows anyone to create and kickstart their
        own projects and anytime someone wants to fund them.
      </p>
      <p>
        Nearkick is designed for people who want to start a project, no matter
        the purpose. Projects are found and funded on Nearkick by people on the
        platform. Users can also contribute to the projects they are interested
        in, which allows project creators to gain value and become more
        successful.
      </p>
      <p>
        This project is a entry into the Near MetaBUILD Hackathon (
        <a
          href="https://metabuild.devpost.com"
          target="_blank"
          rel="noreferrer"
        >
          https://metabuild.devpost.com
        </a>
        ). I built this on my own in less than two months. This project is open
        source. You can check out the code here:{" "}
        <a
          href="https://github.com/amirsaranBIH/nearkick"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/amirsaranBIH/nearkick
        </a>
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
          <details>
            <summary>What happens if a project doesn't reach its goal?</summary>
            <p>
              If the project is not funded by the marked deadline, the
              supporters will automatically be refunded the amount they have
              contributed. The project will be closed and will no longer be
              elegible for supporting.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

export default About;
