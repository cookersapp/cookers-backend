package controllers

import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.data.validation.Constraints._

object SampleInputTypes extends Controller {
  /*
   * Look at :
   * https://www.playframework.com/documentation/2.2.3/ScalaForms
   * https://www.playframework.com/documentation/2.2.3/api/scala/index.html#play.api.data.Forms$
   * https://github.com/playframework/playframework/tree/2.2.3/framework/src/play/src/main/scala/views/helper
   * http://workwithplay.com/blog/2013/07/10/advanced-forms-techniques/
   */
  case class Contact(
    sexe: String,
    mail: String,
    password: String,
    status: String,
    languages: List[String],
    frameworks: List[String],
    bio: String)

  object Contact {
    val mapForm = mapping(
      "sexe" -> nonEmptyText,
      "mail" -> nonEmptyText,
      "password" -> nonEmptyText,
      "status" -> nonEmptyText,
      "languages" -> list(text),
      "frameworks" -> list(text),
      "bio" -> text)(Contact.apply)(Contact.unapply)
  }

  val contactForm: Form[Contact] = Form(Contact.mapForm)

  val sexeValues: List[String] = List("Mme", "Mlle", "M.") // for radios
  val statusValues: List[String] = List("Single", "Married") // for select
  val languageValues: List[String] = List("Scala", "JavaScript", "Ruby", "Java", "Python") // for multiselect
  val frameworkValues: List[String] = List("Play", "Struts", "Angular", "Django", "Symphony") // for checkboxes

  def index = Action {
    val existingContact = Contact(
      "M.",
      "loic@mail.com",
      "xxx",
      "Married",
      List("Scala", "JavaScript", "Java"),
      List("Play", "Angular"),
      "Developpeur :\nScala / Play / Angular")

    Ok(views.html.samples.inputtypes(contactForm.fill(existingContact), sexeValues, languageValues, frameworkValues, statusValues))
  }

  def create = Action { implicit request =>
    contactForm.bindFromRequest.fold(
      formWithErrors => BadRequest(views.html.samples.inputtypes(formWithErrors, sexeValues, languageValues, frameworkValues, statusValues)),
      contact => {
        println("Create contact :\n" + contact)
        Ok(views.html.samples.inputtypes(contactForm, sexeValues, languageValues, frameworkValues, statusValues))
      })
  }
}