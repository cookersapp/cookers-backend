package controllers

import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.data.validation.Constraints._

object SampleInputTypes extends Controller {
  /*
   * Look at :
   * https://www.playframework.com/documentation/2.2.x/ScalaForms
   * https://github.com/playframework/playframework/tree/2.2.x/framework/src/play/src/main/scala/views/helper 
   * http://workwithplay.com/blog/2013/07/10/advanced-forms-techniques/
   */
  /*
   * TODO :
   * set values in checkboxes and multipleselect
   * rename all inputs with bs3... to avoid conflics with standards helpers
   * create generic input to allow html5 types (number, date...)
   * split inputs in layout & input to better modularize
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
  val statusValues: Seq[(String, String)] = List("Single", "Married").map(s => (s, s)).toSeq // for select
  val languageValues: Seq[(String, String)] = List("Scala", "JavaScript", "Ruby", "Java", "Python").map(s => (s, s)).toSeq // for multiselect
  val frameworkValues: Seq[(String, String)] = List("Play", "Struts", "Angular", "Django", "Symphony").map(s => (s, s)).toSeq // for checkboxes

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