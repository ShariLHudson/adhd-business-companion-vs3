# 307 — User Capability, Experience, and Confidence Graph

## Purpose

Define how Spark Estate adapts to different levels of knowledge, experience, confidence, and support needs across individual business capabilities.

## Core rule

Never label a user globally as:

- beginner
- intermediate
- advanced

A person may be advanced in one capability and unfamiliar with another.

## Separate dimensions

For each capability, track independently:

### Knowledge

What the user understands.

Suggested levels:

- unknown
- emerging
- working
- strong
- expert

### Experience

What the user has actually done.

Suggested levels:

- none observed
- attempted
- repeated
- extensive
- professional

### Confidence

How confident the user feels.

Suggested levels:

- very low
- low
- variable
- high
- very high

### Independence

How much support they currently need.

Suggested levels:

- do it with me
- guide me closely
- review my work
- advise when needed
- independent

### Evidence

Evidence may include:

- completed Work
- uploaded materials
- user statements
- outcomes
- certifications
- repeated behavior
- reviews
- decisions
- corrections
- observed success

## Capability state contract

Each state must include:

- user ID
- business ID
- capability ID
- knowledge level
- experience level
- confidence level
- independence preference
- evidence
- source
- user-confirmed flag
- last updated
- staleness
- contextual notes

## Adaptation matrix

### High knowledge + high experience + high confidence

Spark Estate should:

- be concise
- offer strategic tradeoffs
- avoid basic explanations
- support fast execution
- challenge thinking when invited
- provide expert review

### High knowledge + high experience + low confidence

Spark Estate should:

- reflect evidence of competence
- reduce unnecessary teaching
- provide reassurance grounded in proof
- offer review and decision support
- avoid patronizing language
- break final decisions into manageable steps

### Low knowledge + high confidence

Spark Estate should:

- preserve dignity
- identify hidden risks
- verify assumptions
- teach only what matters
- use examples
- prevent avoidable mistakes

### Low knowledge + low confidence

Spark Estate should:

- reduce options
- use clear steps
- explain why each step matters
- provide examples
- celebrate progress
- avoid jargon
- support recovery after interruption

### High knowledge + low experience

Spark Estate should:

- move from theory to application
- provide practice
- use checklists and examples
- review first attempts
- build evidence

### High experience + low formal knowledge

Spark Estate should:

- respect practical wisdom
- explain frameworks without invalidating experience
- connect intuitive methods to reusable models
- avoid unnecessary academic language

## Dynamic state

Capability state is not permanent.

It may change because:

- user learns
- user succeeds
- user encounters a new context
- technology changes
- business stage changes
- confidence changes
- health or stress changes
- long gaps occur

## User correction

The user must be able to say:

- I already know this.
- I have never done this.
- I want more detail.
- I just need a checklist.
- I want you to challenge me.
- I am not confident about this.
- I need you to stay with me.
- Let me do this myself.

These corrections should update support behavior without forcing a full profile edit.

## Capability-gap recommendations

Spark Estate may recommend learning or support when:

- the gap blocks a current goal
- the gap creates material risk
- the user asks to grow
- repeated friction suggests support would help

It should not generate endless development plans for every weak area.

## Evidence Bank integration

Relevant wins and completed Work may contribute evidence to:

- capability growth
- confidence growth
- independence
- readiness for more advanced Work

The user should be able to review and correct inferred growth.

## Required tests

- independent dimension tracking
- high-knowledge/low-confidence behavior
- low-knowledge/high-confidence behavior
- capability-specific adaptation
- business-specific capability state
- user correction
- evidence update
- stale state handling
- no global labeling
- respectful tone
- support-mode switching
