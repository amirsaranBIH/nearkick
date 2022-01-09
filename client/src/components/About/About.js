import "./About.css";

function About() {
  return (
    <div className="about">
      <h1 className="h1">About</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nisi felis,
        ullamcorper et leo non, posuere maximus velit. Curabitur a tortor vel
        justo pellentesque tempus. Suspendisse consectetur sodales tincidunt.
        Nam eu erat at sapien molestie ultricies ut at odio. Duis facilisis at
        ipsum a pretium. Mauris blandit ullamcorper pulvinar. Morbi dapibus
        lacus consequat, finibus lacus et, mattis quam. Nullam ac tempor eros, a
        rhoncus lectus.
      </p>
      <p>
        Sed et ultricies mauris. Donec bibendum, urna tristique dignissim
        fringilla, metus ligula ultricies turpis, sit amet tristique massa elit
        a lorem. Proin luctus sed ex et hendrerit. Aenean fringilla neque ac
        suscipit porta. Sed facilisis velit at nisl consectetur, tincidunt
        consequat orci dictum. Morbi vitae risus semper, elementum dui id,
        consectetur purus. Aliquam imperdiet malesuada augue, lacinia dignissim
        odio bibendum sed. Cras nec quam vulputate, vehicula nulla luctus,
        sollicitudin nulla.
      </p>
      <div className="faq">
        <h2>Frequently Asked Questions</h2>
        <ul>
          <li>1. Question text here?</li>
          <li>2. Question text here?</li>
          <li>3. Question text here?</li>
          <li>4. Question text here?</li>
        </ul>
      </div>
    </div>
  );
}

export default About;
