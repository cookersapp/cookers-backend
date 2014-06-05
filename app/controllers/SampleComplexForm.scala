package controllers

import scala.concurrent.Future
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.data.validation.Constraints._

object SampleComplexForm extends Controller {
  case class Contact(
    firstname: String,
    lastname: String,
    company: Option[String],
    informations: Seq[ContactInformation])

  object Contact {
    val mapForm = mapping(
      "firstname" -> nonEmptyText,
      "lastname" -> nonEmptyText,
      "company" -> optional(text),
      "informations" -> seq(ContactInformation.mapForm))(Contact.apply)(Contact.unapply)
  }

  case class ContactInformation(
    label: String,
    email: Option[String],
    phones: List[String])

  object ContactInformation {
    val mapForm = mapping(
      "label" -> nonEmptyText,
      "email" -> optional(email),
      "phones" -> list(text verifying pattern("""[0-9.+]+""".r, error = "A valid phone number is required")))(ContactInformation.apply)(ContactInformation.unapply)
  }

  val contactForm: Form[Contact] = Form(Contact.mapForm)

  def index = Action {
    val existingContact = Contact("Fake", "Contact", Some("Fake company"), informations = List(
      ContactInformation("Personal", Some("fakecontact@gmail.com"), List("01.23.45.67.89", "98.76.54.32.10", "98.76.54.32.10")),
      ContactInformation("Professional", Some("fakecontact@company.com"), List("01.23.45.67.89")),
      ContactInformation("Previous", Some("fakecontact@oldcompany.com"), List())))

    Ok(views.html.samples.complexform(contactForm.fill(existingContact)))
  }

  def create = Action.async { implicit request =>
    contactForm.bindFromRequest.fold(
      formWithErrors => Future.successful(BadRequest(views.html.samples.complexform(formWithErrors))),
      contact => {
        println("Create contact :\n" + contact)
        Future.successful(Ok(views.html.samples.complexform(contactForm)))
      })
  }
}